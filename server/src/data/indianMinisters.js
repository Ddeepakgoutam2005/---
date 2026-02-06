// Shared datasets for Indian ministers and sample promises
export const indianMinisters = [
  {
    name: 'Narendra Modi',
    ministry: 'Prime Minister',
    party: 'BJP',
    constituency: 'Varanasi',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5f/The_official_portrait_of_Shri_Narendra_Modi%2C_the_Prime_Minister_of_the_Republic_of_India.jpg',
    bio: 'Narendra Damodardas Modi is the 14th Prime Minister of India, in office since 2014.'
  },
  {
    name: 'Amit Shah',
    ministry: 'Home Affairs',
    party: 'BJP',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fd/Shri_Amit_Shah_in_Raigad.jpg',
    bio: 'Amit Anilchandra Shah is the Minister of Home Affairs and former President of BJP.'
  },
  {
    name: 'Nirmala Sitharaman',
    ministry: 'Finance',
    party: 'BJP',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/26/Am_11._April_2025_empfing_Au%C3%9Fenministerin_Beate_Meinl-Reisinger_die_indische_Finanzministerin_Nirmala_Sitharaman_in_Wien_%2854445397025%29_%28cropped%29.jpg',
    bio: 'Nirmala Sitharaman is the Minister of Finance of India.'
  },
  {
    name: 'Rajnath Singh',
    ministry: 'Defence',
    party: 'BJP',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/27/Defence_Minister_Shri_Rajnath_Singh.jpg',
    bio: 'Rajnath Singh is the Minister of Defence and former Chief Minister of Uttar Pradesh.'
  },
  {
    name: 'S. Jaishankar',
    ministry: 'External Affairs',
    party: 'BJP',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/The_official_portrait_of_External_Minister_Subrahmanyam_Jaishankar.jpg',
    bio: 'Subrahmanyam Jaishankar is the Minister of External Affairs and a former Foreign Secretary.'
  },
  {
    name: 'Nitin Gadkari',
    ministry: 'Road Transport and Highways',
    party: 'BJP',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/8c/Nitin_Jairam_Gadkari.jpg',
    bio: 'Nitin Gadkari is known for infrastructure development, serving as Minister for Road Transport and Highways.'
  },
  {
    name: 'Piyush Goyal',
    ministry: 'Commerce and Industry',
    party: 'BJP',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/63/Piyush_Goyal_crop.jpg',
    bio: 'Piyush Goyal oversees Commerce and Industry; previously held Railways and Coal portfolios.'
  },
  {
    name: 'Ashwini Vaishnaw',
    ministry: 'Railways; Communications; Electronics and IT',
    party: 'BJP',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/95/Shri_Ashwini_Vaishnaw_Minister.jpg',
    bio: 'Ashwini Vaishnaw is Minister for Railways and Information Technology, focusing on modernization.'
  },
  {
    name: 'Hardeep Singh Puri',
    ministry: 'Petroleum and Natural Gas; Housing and Urban Affairs',
    party: 'BJP',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4d/Hardeep_Singh_Puri_with_PM_Modi_%28cropped%29.jpg',
    bio: 'Hardeep Singh Puri is a former diplomat, leading urban affairs and energy portfolios.'
  },
  {
    name: 'Mansukh Mandaviya',
    ministry: 'Health and Family Welfare',
    party: 'BJP',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/26/Mansukh_Mandaviya_photo_2.png',
    bio: 'Mansukh Mandaviya is the Minister of Health and Family Welfare.'
  },
  {
    name: 'Dharmendra Pradhan',
    ministry: 'Education',
    party: 'BJP',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Dharmendra_Pradhan%2C_Minister_of_Education.jpg',
    bio: 'Dharmendra Pradhan is the Minister of Education, focusing on NEP implementation.'
  },
  {
    name: 'Anurag Thakur',
    ministry: 'Information and Broadcasting',
    party: 'BJP',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d6/Shri_Anurag_Singh_Thakur_in_March_2023.jpg',
    bio: 'Anurag Thakur served as Minister of Information and Broadcasting and Youth Affairs.'
  },
  {
    name: 'Smriti Irani',
    ministry: 'Women and Child Development',
    party: 'BJP',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/33/Smt._Smriti_Irani_in_April_2023.jpg',
    bio: 'Smriti Irani has served in multiple ministries, including Women and Child Development and HRD.'
  },
  {
    name: 'Pralhad Joshi',
    ministry: 'Parliamentary Affairs; Coal and Mines',
    party: 'BJP',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Pralhad_Joshi_in_2024.jpg',
    bio: 'Pralhad Joshi manages Parliamentary Affairs and previously Coal and Mines portfolios.'
  },
  {
    name: 'Gajendra Singh Shekhawat',
    ministry: 'Jal Shakti',
    party: 'BJP',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/46/The_Union_Minister_of_Culture_and_Tourism%2C_Shri_Gajendra_Singh_Shekhawat_addressing_at_the_inauguration_of_the_7th_Edition_of_the_International_Hospitality_Expo._2024_at_Greater_Noida%2C_in_Uttar_Pradesh_on_August_03%2C_2024_%28cropped%29.jpg',
    bio: 'Gajendra Singh Shekhawat leads the Ministry of Jal Shakti (Water Resources).'
  },
  {
    name: 'Narayan Rane',
    ministry: 'Micro, Small and Medium Enterprises',
    party: 'BJP',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/73/Narayan_Rane_with_PM_Modi_%28cropped%29.jpg',
    bio: 'Narayan Rane oversees MSME sector development.'
  },
  {
    name: 'Bhupender Yadav',
    ministry: 'Environment, Forest and Climate Change; Labour and Employment',
    party: 'BJP',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Union_Minister_Bhupender_Yadav.jpg',
    bio: 'Bhupender Yadav manages environment and labour portfolios.'
  }
  ,
  // INC (Congress)
  {
    name: 'Siddaramaiah',
    ministry: 'Chief Minister of Karnataka',
    party: 'INC',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/bc/The_Chief_Minister_of_Karnataka_Siddaramaiah_visits_PMO.jpg',
    bio: 'Siddaramaiah is serving as the Chief Minister of Karnataka from INC.'
  },
  {
    name: 'A. Revanth Reddy',
    ministry: 'Chief Minister of Telangana',
    party: 'INC',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c0/Portrait_of_Telangana_CM_Revanth_Reddy.png',
    bio: 'A. Revanth Reddy is the Chief Minister of Telangana and senior INC leader.'
  },
  {
    name: 'P. Chidambaram',
    ministry: 'Finance (former)',
    party: 'INC',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/P.Chidambaram_in_a_press_conference.jpg',
    bio: 'P. Chidambaram is a senior Congress leader and former Union Finance Minister.'
  },
  // AAP
  {
    name: 'Arvind Kejriwal',
    ministry: 'Chief Minister of Delhi',
    party: 'AAP',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/de/Arvind_Kejriwal_2022_Official_Portrail_%28AI_enhanced%29.jpg',
    bio: 'Arvind Kejriwal is the National Convener of AAP and Chief Minister of Delhi.'
  },
  {
    name: 'Bhagwant Mann',
    ministry: 'Chief Minister of Punjab',
    party: 'AAP',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f8/Bhagwant_Mann.png',
    bio: 'Bhagwant Mann is the Chief Minister of Punjab from AAP.'
  },
  // BSP
  {
    name: 'Mayawati',
    ministry: 'Former Chief Minister of Uttar Pradesh',
    party: 'BSP',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e6/Mayawati_in_2016.jpg',
    bio: 'Mayawati is the President of BSP and served four terms as Chief Minister of Uttar Pradesh.'
  },
  // Additional ministers and chief ministers across parties to reach 50+
  { name: 'Yogi Adityanath', ministry: 'Chief Minister of Uttar Pradesh', party: 'BJP', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/12/PM_and_UP_CM_at_laying_the_foundation_stone_of_the_International_Cricket_Stadium_at_Varanasi%2C_in_Uttar_Pradesh_%283x4_cropped%29.jpg', bio: 'Yogi Adityanath is the Chief Minister of Uttar Pradesh.' },
  { name: 'Himanta Biswa Sarma', ministry: 'Chief Minister of Assam', party: 'BJP', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/54/Himanta_Biswa_Sarma_in_2025.jpg', bio: 'Himanta Biswa Sarma is the Chief Minister of Assam.' },
  { name: 'Shivraj Singh Chouhan', ministry: 'Former Chief Minister of Madhya Pradesh', party: 'BJP', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b8/Shivraj_Singh_Chouhan_2025.jpg', bio: 'Shivraj Singh Chouhan served multiple terms as CM of Madhya Pradesh.' },
  { name: 'Ashok Gehlot', ministry: 'Former Chief Minister of Rajasthan', party: 'INC', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/55/PM_and_Gehlot_inaugurate_various_projects_at_Nathdwara_2023.jpg', bio: 'Ashok Gehlot is a senior Congress leader and former CM of Rajasthan.' },
  { name: 'Bhupesh Baghel', ministry: 'Former Chief Minister of Chhattisgarh', party: 'INC', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/1d/Bhupesh_Baghel.jpg', bio: 'Bhupesh Baghel is a Congress leader and former CM of Chhattisgarh.' },
  { name: 'Kamal Nath', ministry: 'Former Chief Minister of Madhya Pradesh', party: 'INC', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/0d/Kamal_Nath_2012.jpg', bio: 'Kamal Nath is a veteran Congress leader and former CM of MP.' },
  { name: 'M. K. Stalin', ministry: 'Chief Minister of Tamil Nadu', party: 'DMK', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/9d/The_Chief_Minister_of_Tamil_Nadu%2C_Thiru_MK_Stalin.jpg', bio: 'MK Stalin is the DMK leader and Chief Minister of Tamil Nadu.' },
  { name: 'Pinarayi Vijayan', ministry: 'Chief Minister of Kerala', party: 'CPI(M)', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Chief_Minister_Pinarayi_Vijayan_2023.tif/400px-Chief_Minister_Pinarayi_Vijayan_2023.tif.jpg', bio: 'Pinarayi Vijayan is the Chief Minister of Kerala from CPI(M).'},
  { name: 'Mamata Banerjee', ministry: 'Chief Minister of West Bengal', party: 'TMC', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4d/Official_portrait_of_Mamata_Banerjee.jpg', bio: 'Mamata Banerjee is the Chief Minister of West Bengal and leader of TMC.' },
  { name: 'Nitish Kumar', ministry: 'Chief Minister of Bihar', party: 'JD(U)', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/07/Nitish_Kumar_addressing_at_55th_anniversary_of_Vishwa_Shanti_Stupa_establishment_in_Rajgir_%28cropped%29.jpg', bio: 'Nitish Kumar is the Chief Minister of Bihar.' },
  { name: 'Eknath Shinde', ministry: 'Chief Minister of Maharashtra', party: 'Shiv Sena', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Eknath_Shinde_with_PM_Narendra_Modi_Cropped.jpg', bio: 'Eknath Shinde is the Chief Minister of Maharashtra.' },
  { name: 'Uddhav Thackeray', ministry: 'Former Chief Minister of Maharashtra', party: 'Shiv Sena', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Uddhav_Thackeray%2C_President_of_Shiv_Sena-UBT.jpg', bio: 'Uddhav Thackeray served as CM of Maharashtra.' },
  { name: 'K. Chandrashekar Rao', ministry: 'Former Chief Minister of Telangana', party: 'BRS', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/3f/Kalvakuntla_Chandrashekar_Rao.png', bio: 'KCR is the founder of BRS and former CM of Telangana.' },
  { name: 'Naveen Patnaik', ministry: 'Former Chief Minister of Odisha', party: 'BJD', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Naveen_Patnaik.png', bio: 'Naveen Patnaik served as the long-time CM of Odisha.' },
  { name: 'Sarbananda Sonowal', ministry: 'Ports, Shipping and Waterways; AYUSH', party: 'BJP', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Sarbananda_Sonowal_with_PM_Modi_%28cropped%29.jpg', bio: 'Sarbananda Sonowal is a Union Minister handling ports and AYUSH.' },
  { name: 'Jyotiraditya Scindia', ministry: 'Civil Aviation', party: 'BJP', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d6/Jyotiraditya_Scindia_at_the_India_Economic_Summit_2009.jpg', bio: 'Jyotiraditya Scindia is the Minister of Civil Aviation.' },
  { name: 'Kiren Rijiju', ministry: 'Law and Justice', party: 'BJP', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d7/Kiren_Rijiju_with_Modi_%28cropped%29.jpg', bio: 'Kiren Rijiju has served as Minister of Law and Justice.' },
  { name: 'Arjun Ram Meghwal', ministry: 'Law and Justice (MoS)', party: 'BJP', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/03/Shri_Arjun_Ram_Meghwal.jpg', bio: 'Arjun Ram Meghwal has served as MoS for Law and Justice.' },
  { name: 'Rajeev Chandrasekhar', ministry: 'Electronics and IT (MoS)', party: 'BJP', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5a/Rajeev_Chandrasekhar_with_PM_Modi_%28cropped%29.jpg', bio: 'Rajeev Chandrasekhar is MoS for Electronics and IT.' },
  { name: 'Giriraj Singh', ministry: 'Rural Development', party: 'BJP', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Giriraj_Singh_addressing_a_press_conference_on_the_achievements_of_the_Ministry_of_Micro%2C_Small_%26_Medium_Enterprises%2C_during_the_last_four_years%2C_in_New_Delhi_%28cropped%29.JPG', bio: 'Giriraj Singh has served as Minister for Rural Development.' },
  { name: 'Parshottam Rupala', ministry: 'Fisheries, Animal Husbandry and Dairying', party: 'BJP', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5c/The_Union_Minister_for_Fisheries%2C_Animal_Husbandry_and_Dairying%2C_Shri_Parshottam_Rupala.jpg', bio: 'Parshottam Rupala leads fisheries and animal husbandry.' },
  { name: 'Mahendra Nath Pandey', ministry: 'Heavy Industries', party: 'BJP', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/98/MN_Pandey.jpg', bio: 'Mahendra Nath Pandey has served as Minister of Heavy Industries.' },
  { name: 'G. Kishan Reddy', ministry: 'Culture; Development of North Eastern Region', party: 'BJP', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/55/G._Kishan_Reddy_in_2025.jpg', bio: 'G Kishan Reddy has served as Minister of Culture and DoNER.' },
  { name: 'Anupriya Patel', ministry: 'Commerce and Industry (MoS)', party: 'Apna Dal (S)', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/34/The_official_portrait_of_State_Minister_Anupriya_Patel.jpg', bio: 'Anupriya Patel is MoS for Commerce and Industry.' },
  { name: 'Jitendra Singh', ministry: 'PMO; Science and Technology (MoS)', party: 'BJP', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e2/The_Minister_of_State_for_Personnel%2C_Public_Grievances_%26_Pensions%2C_Dr._Jitendra_Singh_at_the_exclusive_interview_in_New_Delhi_on_August_4%2C_2024.jpg', bio: 'Jitendra Singh is MoS in PMO and S&T.' },
  { name: 'V. K. Singh', ministry: 'Civil Aviation; MEA (MoS)', party: 'BJP', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/41/DncrmowVYAA6c2i.jpg', bio: 'Gen VK Singh has served as MoS in multiple ministries.' },
  { name: 'Meenakshi Lekhi', ministry: 'External Affairs; Culture (MoS)', party: 'BJP', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/3f/Smt._Meenakshi_Lekhi_%28cropped%29.jpg', bio: 'Meenakshi Lekhi is MoS for External Affairs and Culture.' },
  { name: 'Sadhvi Niranjan Jyoti', ministry: 'Consumer Affairs; Rural Development (MoS)', party: 'BJP', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/04/The_Minister_of_State_for_Consumer_Affairs%2C_Food_%26_Public_Distribution_and_Rural_Development%2C_Sadhvi_Niranjan_Jyoti_addressing_at_the_Yoga_session_organized_by_DoCA%2C_Ministry_of_CA%2CF%26PD%2C_in_New_Delhi_on_June_10%2C_2022.jpg', bio: 'Sadhvi Niranjan Jyoti is MoS in Consumer Affairs.' },
  { name: 'Kaushal Kishore', ministry: 'Housing and Urban Affairs (MoS)', party: 'BJP', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/37/Kaushal_Kishore_cropped.jpg', bio: 'Kaushal Kishore is MoS for Housing and Urban Affairs.' },
  { name: 'Pankaj Chaudhary', ministry: 'Finance (MoS)', party: 'BJP', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/9c/Pankaj_Chaudhary_in_2021_%28cropped%29.jpg', bio: 'Pankaj Chaudhary is MoS in the Ministry of Finance.' },
  { name: 'Nityanand Rai', ministry: 'Home Affairs (MoS)', party: 'BJP', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/87/Nityanand_Rai_%28cropped%29.jpg', bio: 'Nityanand Rai is MoS for Home Affairs.' },
  { name: 'Kailash Choudhary', ministry: 'Agriculture (MoS)', party: 'BJP', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Kailash_Choudhary_in_May_2022_%28cropped%29.jpg', bio: 'Kailash Choudhary is MoS in Agriculture.' },
  { name: 'Prahlad Singh Patel', ministry: 'Food Processing; Jal Shakti', party: 'BJP', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c6/Prahlad_Singh_Patel.jpg', bio: 'Prahlad Singh Patel has served in Jal Shakti and Food Processing.' },
  { name: 'Ashwini Kumar Choubey', ministry: 'Health and Family Welfare (MoS)', party: 'BJP', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Ashwini_Kumar_Choubey.jpg', bio: 'Ashwini Choubey is MoS for Health.' },
  { name: 'Ramdas Athawale', ministry: 'Social Justice and Empowerment (MoS)', party: 'RPI(A)', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Ramdas_Athawale_in_2018.jpg', bio: 'Ramdas Athawale is MoS for Social Justice and Empowerment.' },
  { name: 'Shobha Karandlaje', ministry: 'Agriculture and Farmers Welfare (MoS)', party: 'BJP', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/81/Shobha_Karandlaje_with_PM_Modi.jpg', bio: 'Shobha Karandlaje is MoS in Agriculture.' },
  { name: 'Ajay Bhatt', ministry: 'Defence; Tourism (MoS)', party: 'BJP', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/ea/Ajay_Bhatt_at_Intel_ISEF.jpg', bio: 'Ajay Bhatt is MoS in Defence and Tourism.' },
  { name: 'Bhagwanth Khuba', ministry: 'Chemicals and Fertilizers (MoS)', party: 'BJP', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/ac/Bhagwanth_Khuba_with_Prime_Minister_Narendra_Modi_%28cropped%29.jpg', bio: 'Bhagwanth Khuba is MoS for Chemicals and Fertilizers.' },
  { name: 'Faggan Singh Kulaste', ministry: 'Steel (MoS)', party: 'BJP', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/02/Shri_Faggan_Singh_Kulaste_taking_charge_as_the_Minister_of_State_for_Steel%2C_in_New_Delhi_on_May_31%2C_2019_%28cropped%29.jpg', bio: 'Faggan Singh Kulaste is MoS in Steel.' },
  { name: 'Rao Inderjit Singh', ministry: 'Statistics and Programme Implementation', party: 'BJP', photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b9/Rao_Inderjit_Singh_taking_over_as_Minister_of_State_%28Independent_Charge%29_for_Planning_in_May_2014_%28cropped%29.jpg', bio: 'Rao Inderjit Singh leads Statistics and Programme Implementation.' }
];

export const samplePromises = [
  { ministerName: 'Narendra Modi', title: 'Expand Smart City Mission', description: 'Add new cities and improve urban infrastructure.', category: 'Infrastructure', dateMade: '2019-06-01', status: 'completed', sourceUrl: 'https://www.smartcities.gov.in/' },
  { ministerName: 'Amit Shah', title: 'Strengthen Internal Security Framework', description: 'Enhance police modernization and border management.', category: 'Security', dateMade: '2020-01-15', status: 'pending' },
  { ministerName: 'Nirmala Sitharaman', title: 'Boost MSME Credit Access', description: 'Simplify loans and credit guarantees for MSMEs.', category: 'Economy', dateMade: '2021-08-01', status: 'completed' },
  { ministerName: 'Rajnath Singh', title: 'Modernize Defence Procurement', description: 'Accelerate domestic manufacturing through Atmanirbhar Bharat.', category: 'Defence', dateMade: '2022-02-10', status: 'completed' },
  { ministerName: 'S. Jaishankar', title: 'Strengthen Neighbourhood Diplomacy', description: 'Deepen ties with SAARC and ASEAN nations.', category: 'External Affairs', dateMade: '2021-05-20', status: 'completed' },
  { ministerName: 'Nitin Gadkari', title: 'Build High-Speed Corridors', description: 'New expressways and logistics parks across India.', category: 'Infrastructure', dateMade: '2020-09-01', status: 'completed' },
  { ministerName: 'Piyush Goyal', title: 'Promote Export Competitiveness', description: 'Incentives for exporters and new FTAs.', category: 'Commerce', dateMade: '2022-06-05', status: 'pending' },
  { ministerName: 'Ashwini Vaishnaw', title: 'Railway Modernization and Safety', description: 'Upgrade signalling and station infrastructure.', category: 'Railways', dateMade: '2023-01-10', status: 'completed' },
  { ministerName: 'Hardeep Singh Puri', title: 'Affordable Urban Housing', description: 'Expand PMAY-Urban with faster approvals.', category: 'Urban Affairs', dateMade: '2021-11-01', status: 'pending' },
  { ministerName: 'Mansukh Mandaviya', title: 'Improve Public Health Infrastructure', description: 'Upgrade district hospitals and medical colleges.', category: 'Health', dateMade: '2022-04-12', status: 'completed' },
  { ministerName: 'Dharmendra Pradhan', title: 'Implement NEP Reforms', description: 'Curriculum flexibility and skill integration.', category: 'Education', dateMade: '2021-07-29', status: 'completed' },
  { ministerName: 'Anurag Thakur', title: 'Promote Digital Broadcasting', description: 'Support adoption of new broadcasting standards.', category: 'Information', dateMade: '2022-10-18', status: 'pending' },
  { ministerName: 'Smriti Irani', title: 'Strengthen Child Nutrition Programs', description: 'Expand POSHAN Abhiyaan reach.', category: 'WCD', dateMade: '2020-03-08', status: 'completed' },
  { ministerName: 'Pralhad Joshi', title: 'Legislative Efficiency', description: 'Improve session productivity and discussion time.', category: 'Parliamentary Affairs', dateMade: '2021-12-01', status: 'pending' },
  { ministerName: 'Gajendra Singh Shekhawat', title: 'Ensure Tap Water to All Households', description: 'Accelerate Jal Jeevan Mission implementation.', category: 'Water Resources', dateMade: '2019-08-15', status: 'completed' },
  { ministerName: 'Narayan Rane', title: 'MSME Cluster Development', description: 'Support cluster-based growth initiatives.', category: 'MSME', dateMade: '2022-01-20', status: 'pending' },
  { ministerName: 'Bhupender Yadav', title: 'Strengthen Environmental Compliance', description: 'Streamline clearances while safeguarding ecology.', category: 'Environment', dateMade: '2022-02-28', status: 'completed' },
  { ministerName: 'Nitin Gadkari', title: 'Upgrade 25,000–30,000 km of Two-Lane Highways to Four Lanes', description: 'Nationwide expansion to convert major two-lane national highways into four-lane corridors.', category: 'Infrastructure', dateMade: '2025-03-01', status: 'in_progress', sourceUrl: 'https://www.pib.gov.in/PressReleseDetailm.aspx?PRID=2183405' },
  { ministerName: 'Nitin Gadkari', title: 'Construct 25 Greenfield Expressways', description: 'Development of new greenfield expressways totaling more than 10,000 km.', category: 'Infrastructure', dateMade: '2025-04-01', status: 'in_progress', sourceUrl: 'https://www.pib.gov.in/PressReleseDetailm.aspx?PRID=2183405' },
  { ministerName: 'Nitin Gadkari', title: 'Make Indian Roads Better Than the U.S. in Two Years', description: "A public pledge promising that India's road quality will surpass the United States within two years.", category: 'Infrastructure', dateMade: '2025-03-26', status: 'pending', sourceUrl: 'https://www.hindustantimes.com/india-news/nitin-gadkari-promises-better-road-network-in-india-than-us-in-next-two-years-101742952997480.html' },
  { ministerName: 'Nitin Gadkari', title: 'Use All Municipal Waste in Road Construction by 2027', description: 'National target to use municipal solid waste and plastic waste for road construction by 2027.', category: 'Environment', dateMade: '2024-12-01', status: 'in_progress', sourceUrl: 'https://tmv.in/article/promises-vs-reality-indias-road-infrastructure-under-gadkari' },
  { ministerName: 'Nitin Gadkari', title: 'Implement and Expand the National Vehicle Scrappage Policy', description: 'Policy to phase out old and unfit vehicles through registered scrappage centres and incentives.', category: 'Transport', dateMade: '2021-03-01', status: 'in_progress', sourceUrl: 'https://www.pib.gov.in/Pressreleaseshare.aspx?PRID=1705814' },
  { ministerName: 'Nitin Gadkari', title: 'Expand National Highways to Six Lanes', description: 'Upgrade major national highways to six lanes, covering an estimated 16,000 km.', category: 'Infrastructure', dateMade: '2025-05-15', status: 'pending', sourceUrl: 'https://www.pib.gov.in/PressReleseDetailm.aspx?PRID=2183405' },
  { ministerName: 'Nitin Gadkari', title: 'Approve and Start Regional Highway Connectivity Projects', description: 'Includes projects such as the six-lane Nagpur–Bhandara highway and multiple sanctioned regional corridors.', category: 'Infrastructure', dateMade: '2025-08-01', status: 'in_progress', sourceUrl: 'https://www.rozanaspokesman.com/news/bihar/041125/nitin-gadkari-promises-bihar-world-standard-national-highways-on.html' },
  { ministerName: 'Amit Shah', title: 'Implement Citizenship Amendment Act in First Cabinet Meeting (Bengal)', description: 'During the BJP campaign in West Bengal, Amit Shah promised that a BJP government would implement the Citizenship Amendment Act (CAA) in the very first cabinet meeting.', category: 'Home Affairs', dateMade: '2021-03-07', status: 'in_progress', sourceUrl: 'https://www.ndtv.com/india-news/west-bengal-bjp-manifesto-promises-implementation-of-citizenship-act-one-job-per-family-2395843', priority: 'high', tags: ['CAA','West Bengal'] },
  { ministerName: 'Amit Shah', title: 'One Job Per Family in West Bengal', description: 'In the BJP’s West Bengal manifesto launch, Amit Shah committed that every family would get at least one job if the party formed the government.', category: 'Employment', dateMade: '2021-03-07', status: 'pending', sourceUrl: 'https://timesofindia.indiatimes.com/city/kolkata/bjps-bengal-vow-caa-in-first-cabinet-meet-job-per-family/articleshow/81465779.cms', priority: 'high', tags: ['manifesto','West Bengal'] },
  { ministerName: 'Amit Shah', title: 'Free Education from KG to PG for Girls (Bengal)', description: 'The Bengal manifesto presented by Amit Shah promised free education from kindergarten to post-graduation for all girl students in the state.', category: 'Education', dateMade: '2021-03-07', status: 'pending', sourceUrl: 'https://timesofindia.indiatimes.com/city/kolkata/bjps-bengal-vow-caa-in-first-cabinet-meet-job-per-family/articleshow/81465779.cms', priority: 'high', tags: ['girls','West Bengal'] },
  { ministerName: 'Amit Shah', title: 'Free and Concessionary Travel for Women in Public Transport (Bengal)', description: 'Amit Shah announced that women would receive free or highly subsidised travel in public transport under a BJP government in West Bengal.', category: 'Women & Transport', dateMade: '2021-03-07', status: 'pending', sourceUrl: 'https://www.ndtv.com/india-news/west-bengal-bjp-manifesto-promises-implementation-of-citizenship-act-one-job-per-family-2395843', priority: 'medium', tags: ['women','West Bengal'] },
  { ministerName: 'Amit Shah', title: 'Financial Support for Refugee Families in Bengal', description: 'He promised annual financial assistance to refugee families settled in West Bengal as part of the BJP’s election manifesto.', category: 'Welfare', dateMade: '2021-03-07', status: 'pending', sourceUrl: 'https://www.ndtv.com/india-news/west-bengal-bjp-manifesto-promises-implementation-of-citizenship-act-one-job-per-family-2395843', priority: 'medium', tags: ['refugees','West Bengal'] }
];
