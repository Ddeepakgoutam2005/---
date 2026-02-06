import Minister from '../models/Minister.js';
import NewsUpdate from '../models/NewsUpdate.js';
import PromiseModel from '../models/Promise.js';
import PromiseRelatedNews from '../models/PromiseRelatedNews.js';
import { fetchRssFeeds, preprocessArticle, classifyBatch, matchNewsToPromise } from './geminiClassifier.js';
import dotenv from 'dotenv';
dotenv.config();

const DEFAULT_FEEDS = [
    'https://www.business-standard.com/rss/politics.xml',
    'https://www.navjivanindia.com/stories.rss?section=politics',
    'https://www.indiatv.in/cms/rssfeed',
    'https://timesofindia.indiatimes.com/rss.cms',
    'https://www.republicbharat.com/rss',
    'https://indianexpress.com/rss/',
    'https://www.abplive.com/rss',
    'https://www.indianewsnetwork.com/rss.en.politics.xml',
    'https://www.nationalheraldindia.com/stories.rss?section=politics',
    'https://www.livehindustan.com/rss'
];

async function upsertNews(item, ministerName, classification, confidence, evidenceSnippets) {
    const minister = ministerName ? await Minister.findOne({ name: ministerName }) : null;
    const update = {
        $setOnInsert: {
            headline: item.headline,
            summary: (item.content || '').slice(0, 2000),
            source: (() => { try { return new URL(item.url).hostname; } catch { return 'unknown'; } })(),
            url: item.url,
            publishedAt: item.publishedAt ? new Date(item.publishedAt) : null,
        },
        $set: {
            processedByGemini: true
        },
        $push: { mentions: { ministerName, classification, confidence, snippets: evidenceSnippets } },
    };
    if (minister && minister._id) update.$set.candidateMinister = minister._id;
    if (classification === 'promise') update.$set.isPromiseCandidate = true;
    if (classification === 'critic') update.$set.isPromiseRelated = true;
    await NewsUpdate.updateOne({ url: item.url }, update, { upsert: true });
    const nu = await NewsUpdate.findOne({ url: item.url });

    if (classification === 'critic') {
        // Create initial related news entry (without specific promise link first)
        await PromiseRelatedNews.updateOne(
            { url: item.url },
            {
                $setOnInsert: {
                    headline: item.headline,
                    summary: (item.content || '').slice(0, 2000),
                    source: (() => { try { return new URL(item.url).hostname; } catch { return 'unknown'; } })(),
                    url: item.url,
                    publishedAt: item.publishedAt ? new Date(item.publishedAt) : null,
                },
                $set: {
                    minister: nu?.candidateMinister || (minister ? minister._id : undefined),
                    newsUpdate: nu?._id,
                    classification: 'critic',
                    confidence: confidence || 0,
                    // promise: null // Will be linked in the second pass
                },
            },
            { upsert: true }
        );
    }
    return nu;
}

async function attachPromise(ministerName, promiseObj, sourceItem = null, explicitPromiseId = null) {
    if (!promiseObj || !promiseObj.evidenceText || (promiseObj.confidence || 0) < 0.5) return null;
    const minister = await Minister.findOne({ name: ministerName });
    const ministerId = minister ? minister._id : null;
    
    let existing = null;
    if (explicitPromiseId) {
        existing = await PromiseModel.findById(explicitPromiseId);
    } else {
        existing = await PromiseModel.findOne({
            $or: [
                { title: promiseObj.title },
                { description: { $regex: promiseObj.evidenceText.slice(0, 50), $options: 'i' } },
            ],
            minister: ministerId,
        });
    }

    if (existing) {
        // Logic to update status if news indicates a change (e.g. completion or failure)
        // We only update status if the confidence is high and the status is explicitly different from pending
        if (promiseObj.status && ['completed', 'broken', 'in_progress'].includes(promiseObj.status)) {
             existing.status = promiseObj.status;
        }

        if ((promiseObj.confidence || 0) > (existing.confidence || 0)) {
            existing.description = existing.description || promiseObj.description;
            existing.evidence = existing.evidence || promiseObj.evidenceText;
            existing.dateMade = existing.dateMade || (promiseObj.dateMade ? new Date(promiseObj.dateMade) : null);
            existing.deadline = existing.deadline || (promiseObj.deadline ? new Date(promiseObj.deadline) : null);
            existing.confidence = Math.max(existing.confidence || 0, promiseObj.confidence || 0);
            await existing.save();
        }
        await existing.save(); // Ensure status save
        return existing;
    } else {
        const p = new PromiseModel({
            minister: ministerId,
            title: promiseObj.title,
            description: promiseObj.description,
            evidence: promiseObj.evidenceText,
            dateMade: promiseObj.dateMade ? new Date(promiseObj.dateMade) : null,
            deadline: promiseObj.deadline ? new Date(promiseObj.deadline) : null,
            status: promiseObj.status || 'pending',
            sourceUrl: sourceItem ? sourceItem.url : null,
            confidence: promiseObj.confidence || 0,
        });
        await p.save();
        return p;
    }
}

async function queueForReview(type, data) {
    console.log(`[QueueForReview] ${type}:`, data.itemId);
}


// NEW: Fetch Only
export async function fetchAndSaveRawNews(feedUrls = DEFAULT_FEEDS, limitPerFeed = 10) {
    const rawItems = await fetchRssFeeds(feedUrls, limitPerFeed);
    let savedCount = 0;
    
    for (const it of rawItems) {
        const item = {
            headline: it.headline,
            summary: preprocessArticle(it.content || it.headline || ''),
            url: it.url,
            source: (() => { try { return new URL(it.url).hostname; } catch { return 'unknown'; } })(),
            publishedAt: it.publishedAt || new Date(),
            processedByGemini: false // Mark as unprocessed
        };
        
        try {
             // Only insert if not exists
             const exists = await NewsUpdate.findOne({ url: item.url });
             if (!exists) {
                 await NewsUpdate.create(item);
                 savedCount++;
             }
        } catch (e) {
            // ignore duplicates
        }
    }
    return { savedCount, totalFetched: rawItems.length };
}

// NEW: Classify Only (reads from DB)
export async function classifySavedNews(ministersListOverride = null, limit = 50) {
    const GEMINI_AVAILABLE = !!process.env.GEMINI_API_KEY;
    if (!GEMINI_AVAILABLE) {
        throw new Error('GEMINI_API_KEY not configured');
    }

    let ministersList = ministersListOverride;
    if (!Array.isArray(ministersList)) {
        const ministers = await Minister.find({}, { name: 1 }).lean();
        ministersList = ministers.map((m) => m.name);
    }

    // Find unprocessed news
    const unprocessedDocs = await NewsUpdate.find({ processedByGemini: false })
        .sort({ createdAt: -1 })
        .limit(limit);

    if (unprocessedDocs.length === 0) return [];

    const items = unprocessedDocs.map(doc => ({
        itemId: doc._id.toString(), // Use DB ID as itemId
        headline: doc.headline,
        content: doc.summary || doc.headline,
        url: doc.url,
        publishedAt: doc.publishedAt,
    }));

    const rules = {
        promiseIndicators: (process.env.PROMISE_INDICATORS || 'will,pledged,committed to,announced,plans to,aims to,targets,will launch,we will,promised').split(','),
        criticIndicators: (process.env.CRITIC_INDICATORS || 'alleged,investigation,scandal,tender,conflict of interest,probe,critic,accused,bribe,share spike,benefit to family,conflict-of-interest').split(','),
        thresholds: {
            autoAttach: parseFloat(process.env.AUTO_ATTACH_THRESHOLD || '0.80'),
            flagForReview: parseFloat(process.env.FLAG_REVIEW_THRESHOLD || '0.60'),
        },
    };

    let classifierResults;
    try {
        classifierResults = await classifyBatch(items, ministersList, rules);
    } catch (e) {
        throw e;
    }

    const processed = [];
    
    for (const result of classifierResults) {
        const doc = unprocessedDocs.find(d => d._id.toString() === result.itemId);
        if (!doc) continue;

        // Mark as processed regardless of result to avoid stuck loop
        // But if found interesting, we update it more
        await NewsUpdate.updateOne({ _id: doc._id }, { processedByGemini: true });

        if (!result.found) {
             processed.push({ itemId: result.itemId, action: 'skipped_unrelated' });
             continue;
        }

        for (const r of result.results || []) {
             // 1. Upsert General News Update (Using DB doc as base)
             const nu = await upsertNews({
                 headline: doc.headline,
                 content: doc.summary,
                 url: doc.url,
                 publishedAt: doc.publishedAt
             }, r.ministerName, r.category, r.classificationConfidence, r.matchedSnippets || []);

             // 2. Handle Promises
            if (r.category === 'promise' && r.recommendedAction === 'attach_to_promises' && r.classificationConfidence >= rules.thresholds.autoAttach) {
                let explicitPromiseId = null;
                // Try to find existing promise using Gemini match if it's potentially an update
                const ministerDoc = await Minister.findOne({ name: r.ministerName });
                if (ministerDoc) {
                    const ministerPromises = await PromiseModel.find({ minister: ministerDoc._id });
                    if (ministerPromises.length > 0) {
                         const matchResult = await matchNewsToPromise({
                              headline: doc.headline,
                              content: doc.summary,
                              url: doc.url
                         }, ministerPromises);
                         if (matchResult && matchResult.matchFound && matchResult.promiseId && matchResult.confidence > 0.6) {
                             explicitPromiseId = matchResult.promiseId;
                         }
                    }
                }

                const createdPromise = await attachPromise(r.ministerName, r.promise, doc, explicitPromiseId);
                processed.push({ itemId: result.itemId, minister: r.ministerName, action: explicitPromiseId ? 'updated_existing_promise' : 'attach_promise', promiseId: createdPromise?._id || null });
            }

             // 3. Handle Critic/Related News
             else if (r.category === 'critic' && r.recommendedAction === 'attach_to_promise_related' && r.classificationConfidence >= rules.thresholds.autoAttach) {
                 // Check if we can link this to an EXISTING promise
                let linkedPromiseId = null;
                const ministerDoc = await Minister.findOne({ name: r.ministerName });
                if (ministerDoc) {
                    const ministerPromises = await PromiseModel.find({ minister: ministerDoc._id });
                    if (ministerPromises.length > 0) {
                        const matchResult = await matchNewsToPromise({
                             headline: doc.headline,
                             content: doc.summary,
                             url: doc.url
                        }, ministerPromises);
                        if (matchResult && matchResult.matchFound && matchResult.promiseId) {
                            linkedPromiseId = matchResult.promiseId;
                        }
                    }
                }

                const prn = await PromiseRelatedNews.findOne({ url: doc.url });
                if (prn) {
                    if (linkedPromiseId) {
                        prn.promise = linkedPromiseId;
                        await prn.save();
                        processed.push({ itemId: result.itemId, minister: r.ministerName, action: 'saved_promise_related_linked', relatedId: prn._id, linkedPromise: linkedPromiseId });
                    } else {
                        processed.push({ itemId: result.itemId, minister: r.ministerName, action: 'saved_promise_related_generic', relatedId: prn._id });
                    }
                }
             }
             
             else {
                if (r.flagForReview || r.classificationConfidence < rules.thresholds.autoAttach) {
                    await queueForReview('classification', { itemId: result.itemId, minister: r.ministerName, result: r, rawItem: doc });
                }
             }
        }
    }
    return processed;
}

// Keep old function for backward compatibility but redirect to new flow
export async function processNewsFeeds(feedUrls = DEFAULT_FEEDS, limitPerFeed = 8, ministersListOverride = null) {
    // 1. Fetch
    await fetchAndSaveRawNews(feedUrls, limitPerFeed);
    // 2. Classify
    return await classifySavedNews(ministersListOverride, 50); // limit 50 per batch
}
