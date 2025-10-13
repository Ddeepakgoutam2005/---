// Shared datasets for Indian ministers and sample promises
export const indianMinisters = [
  {
    name: 'Narendra Modi',
    ministry: 'Prime Minister',
    party: 'BJP',
    constituency: 'Varanasi',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/12/PM_Modi_2024.jpg',
    bio: 'Narendra Damodardas Modi is the 14th Prime Minister of India, in office since 2014.'
  },
  {
    name: 'Amit Shah',
    ministry: 'Home Affairs',
    party: 'BJP',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Amit_Shah_%28cropped%29.jpg',
    bio: 'Amit Anilchandra Shah is the Minister of Home Affairs and former President of BJP.'
  },
  {
    name: 'Nirmala Sitharaman',
    ministry: 'Finance',
    party: 'BJP',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/43/Smt._Nirmala_Sitharaman_official.jpg',
    bio: 'Nirmala Sitharaman is the Minister of Finance of India.'
  },
  {
    name: 'Rajnath Singh',
    ministry: 'Defence',
    party: 'BJP',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/0f/Shri_Rajnath_Singh%2C_Hon%27ble_Defence_Minister.jpg',
    bio: 'Rajnath Singh is the Minister of Defence and former Chief Minister of Uttar Pradesh.'
  },
  {
    name: 'S. Jaishankar',
    ministry: 'External Affairs',
    party: 'BJP',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fb/Dr._S._Jaishankar_%28cropped%29.jpg',
    bio: 'Subrahmanyam Jaishankar is the Minister of External Affairs and a former Foreign Secretary.'
  },
  {
    name: 'Nitin Gadkari',
    ministry: 'Road Transport and Highways',
    party: 'BJP',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/1b/Nitin_Gadkari_official.jpg',
    bio: 'Nitin Gadkari is known for infrastructure development, serving as Minister for Road Transport and Highways.'
  },
  {
    name: 'Piyush Goyal',
    ministry: 'Commerce and Industry',
    party: 'BJP',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/12/Piyush_Goyal.jpg',
    bio: 'Piyush Goyal oversees Commerce and Industry; previously held Railways and Coal portfolios.'
  },
  {
    name: 'Ashwini Vaishnaw',
    ministry: 'Railways; Communications; Electronics and IT',
    party: 'BJP',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/90/Ashwini_Vaishnaw_Official_Photograph.jpg',
    bio: 'Ashwini Vaishnaw is Minister for Railways and Information Technology, focusing on modernization.'
  },
  {
    name: 'Hardeep Singh Puri',
    ministry: 'Petroleum and Natural Gas; Housing and Urban Affairs',
    party: 'BJP',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/06/Hardeep_Singh_Puri.jpg',
    bio: 'Hardeep Singh Puri is a former diplomat, leading urban affairs and energy portfolios.'
  },
  {
    name: 'Mansukh Mandaviya',
    ministry: 'Health and Family Welfare',
    party: 'BJP',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/07/Dr._Mansukh_Mandaviya.jpg',
    bio: 'Mansukh Mandaviya is the Minister of Health and Family Welfare.'
  },
  {
    name: 'Dharmendra Pradhan',
    ministry: 'Education',
    party: 'BJP',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/52/Dharmendra_Pradhan.jpg',
    bio: 'Dharmendra Pradhan is the Minister of Education, focusing on NEP implementation.'
  },
  {
    name: 'Anurag Thakur',
    ministry: 'Information and Broadcasting',
    party: 'BJP',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/20/Anurag_Thakur.jpg',
    bio: 'Anurag Thakur served as Minister of Information and Broadcasting and Youth Affairs.'
  },
  {
    name: 'Smriti Irani',
    ministry: 'Women and Child Development',
    party: 'BJP',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a1/Smriti_Irani_official_photo.jpg',
    bio: 'Smriti Irani has served in multiple ministries, including Women and Child Development and HRD.'
  },
  {
    name: 'Pralhad Joshi',
    ministry: 'Parliamentary Affairs; Coal and Mines',
    party: 'BJP',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/23/Pralhad_Joshi.jpg',
    bio: 'Pralhad Joshi manages Parliamentary Affairs and previously Coal and Mines portfolios.'
  },
  {
    name: 'Gajendra Singh Shekhawat',
    ministry: 'Jal Shakti',
    party: 'BJP',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/3d/Gajendra_Singh_Shekhawat.jpg',
    bio: 'Gajendra Singh Shekhawat leads the Ministry of Jal Shakti (Water Resources).'
  },
  {
    name: 'Narayan Rane',
    ministry: 'Micro, Small and Medium Enterprises',
    party: 'BJP',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d1/Narayan_Rane.jpg',
    bio: 'Narayan Rane oversees MSME sector development.'
  },
  {
    name: 'Bhupender Yadav',
    ministry: 'Environment, Forest and Climate Change; Labour and Employment',
    party: 'BJP',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/0d/Bhupender_Yadav.jpg',
    bio: 'Bhupender Yadav manages environment and labour portfolios.'
  }
];

export const samplePromises = [
  { ministerName: 'Narendra Modi', title: 'Expand Smart City Mission', description: 'Add new cities and improve urban infrastructure.', category: 'Infrastructure', dateMade: '2019-06-01', status: 'in_progress', sourceUrl: 'https://www.smartcities.gov.in/' },
  { ministerName: 'Amit Shah', title: 'Strengthen Internal Security Framework', description: 'Enhance police modernization and border management.', category: 'Security', dateMade: '2020-01-15', status: 'pending' },
  { ministerName: 'Nirmala Sitharaman', title: 'Boost MSME Credit Access', description: 'Simplify loans and credit guarantees for MSMEs.', category: 'Economy', dateMade: '2021-08-01', status: 'completed' },
  { ministerName: 'Rajnath Singh', title: 'Modernize Defence Procurement', description: 'Accelerate domestic manufacturing through Atmanirbhar Bharat.', category: 'Defence', dateMade: '2022-02-10', status: 'in_progress' },
  { ministerName: 'S. Jaishankar', title: 'Strengthen Neighbourhood Diplomacy', description: 'Deepen ties with SAARC and ASEAN nations.', category: 'External Affairs', dateMade: '2021-05-20', status: 'in_progress' },
  { ministerName: 'Nitin Gadkari', title: 'Build High-Speed Corridors', description: 'New expressways and logistics parks across India.', category: 'Infrastructure', dateMade: '2020-09-01', status: 'in_progress' },
  { ministerName: 'Piyush Goyal', title: 'Promote Export Competitiveness', description: 'Incentives for exporters and new FTAs.', category: 'Commerce', dateMade: '2022-06-05', status: 'pending' },
  { ministerName: 'Ashwini Vaishnaw', title: 'Railway Modernization and Safety', description: 'Upgrade signalling and station infrastructure.', category: 'Railways', dateMade: '2023-01-10', status: 'in_progress' },
  { ministerName: 'Hardeep Singh Puri', title: 'Affordable Urban Housing', description: 'Expand PMAY-Urban with faster approvals.', category: 'Urban Affairs', dateMade: '2021-11-01', status: 'pending' },
  { ministerName: 'Mansukh Mandaviya', title: 'Improve Public Health Infrastructure', description: 'Upgrade district hospitals and medical colleges.', category: 'Health', dateMade: '2022-04-12', status: 'in_progress' },
  { ministerName: 'Dharmendra Pradhan', title: 'Implement NEP Reforms', description: 'Curriculum flexibility and skill integration.', category: 'Education', dateMade: '2021-07-29', status: 'in_progress' },
  { ministerName: 'Anurag Thakur', title: 'Promote Digital Broadcasting', description: 'Support adoption of new broadcasting standards.', category: 'Information', dateMade: '2022-10-18', status: 'pending' },
  { ministerName: 'Smriti Irani', title: 'Strengthen Child Nutrition Programs', description: 'Expand POSHAN Abhiyaan reach.', category: 'WCD', dateMade: '2020-03-08', status: 'in_progress' },
  { ministerName: 'Pralhad Joshi', title: 'Legislative Efficiency', description: 'Improve session productivity and discussion time.', category: 'Parliamentary Affairs', dateMade: '2021-12-01', status: 'pending' },
  { ministerName: 'Gajendra Singh Shekhawat', title: 'Ensure Tap Water to All Households', description: 'Accelerate Jal Jeevan Mission implementation.', category: 'Water Resources', dateMade: '2019-08-15', status: 'in_progress' },
  { ministerName: 'Narayan Rane', title: 'MSME Cluster Development', description: 'Support cluster-based growth initiatives.', category: 'MSME', dateMade: '2022-01-20', status: 'pending' },
  { ministerName: 'Bhupender Yadav', title: 'Strengthen Environmental Compliance', description: 'Streamline clearances while safeguarding ecology.', category: 'Environment', dateMade: '2022-02-28', status: 'in_progress' },
];