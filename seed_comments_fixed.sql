-- CONTENT_SEED_COMMENTS: Common Ninja Migration (schema-corrected)
-- Fixes: user_id->author_id, content->body, threads.slug removed, threads.body added
-- Run: psql -U prohp -d prohp_forum -h localhost -f seed_comments_fixed.sql

BEGIN;

-- Create Community Archive user
INSERT INTO users (id, email, password_hash, username, display_name, tier, created_at)
VALUES ('d194f444-e2e0-59ee-b4df-b699e2d25307', 'archive@prohormonepro.com', '$2b$10$ARCHIVE_NOLOGIN_000000000000000000000000000000000000000', 'community_archive', 'Community Archive', 'free', NOW())
ON CONFLICT (email) DO NOTHING;

-- === 1-Testosterone (1 comments) ===
INSERT INTO threads (id, room_id, author_id, title, body, created_at, updated_at)
VALUES ('c5a485a1-1c90-5052-8171-076f6f19c0e6', '78547f3a-7322-46ff-8e42-db75b849bec1', 'fa7cdb88-8d9c-4a04-9b9e-cd6bc08f2aa9', '1-Testosterone - Community Discussion', 'Community discussion thread for 1-Testosterone. Drop your experience below.', NOW(), NOW())
ON CONFLICT DO NOTHING;
UPDATE compounds SET thread_id = 'c5a485a1-1c90-5052-8171-076f6f19c0e6' WHERE slug = '1-testosterone';

INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('b7afbb2a-56ed-591f-b522-74b3bc41d1d4', 'c5a485a1-1c90-5052-8171-076f6f19c0e6', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '**Jay** — Lol I still got a bottle I bought before the ban. Still my favorite prohormone and the one my body reacts the best to with no sides', '2025-06-19T22:50:39Z', '2025-06-19T22:50:39Z')
ON CONFLICT DO NOTHING;

-- === 3-AD (1 comments) ===
INSERT INTO threads (id, room_id, author_id, title, body, created_at, updated_at)
VALUES ('fd293a51-8c5f-5134-9716-e931021f877d', '78547f3a-7322-46ff-8e42-db75b849bec1', 'fa7cdb88-8d9c-4a04-9b9e-cd6bc08f2aa9', '3-AD - Community Discussion', 'Community discussion thread for 3-AD. Drop your experience below.', NOW(), NOW())
ON CONFLICT DO NOTHING;
UPDATE compounds SET thread_id = 'fd293a51-8c5f-5134-9716-e931021f877d' WHERE slug = '3-ad';

INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('d99bd0a2-0e79-528c-a11d-dbb9e41bee87', 'fd293a51-8c5f-5134-9716-e931021f877d', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '**Robert** — I gave 2 bottles of 3-AD a try, during a cut, and I felt a little increase in strength at the recommended dosage. I didn''''t feel any suppression at all. This would only have real merit when stacked with something stronger.', '2025-07-20T20:37:13Z', '2025-07-20T20:37:13Z')
ON CONFLICT DO NOTHING;

-- === Abnormal (3 comments) ===
INSERT INTO threads (id, room_id, author_id, title, body, created_at, updated_at)
VALUES ('d63ef879-07b6-5828-8bfd-81f4a28bc0b1', '78547f3a-7322-46ff-8e42-db75b849bec1', 'fa7cdb88-8d9c-4a04-9b9e-cd6bc08f2aa9', 'Abnormal - Community Discussion', 'Community discussion thread for Abnormal. Drop your experience below.', NOW(), NOW())
ON CONFLICT DO NOTHING;
UPDATE compounds SET thread_id = 'd63ef879-07b6-5828-8bfd-81f4a28bc0b1' WHERE slug = 'abnormal';

INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('50c5fb76-7bb0-56c6-a2ed-a93ab5585dfc', 'd63ef879-07b6-5828-8bfd-81f4a28bc0b1', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '**Charlie** — Has anyone had any recent experiences with this product? Grabbed a bottle of abnormal along with sustanon250.', '2025-12-05T14:09:31Z', '2025-12-05T14:09:31Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('3dbda961-d03f-5f56-bf23-bf36b3ded9ec', 'd63ef879-07b6-5828-8bfd-81f4a28bc0b1', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '**Charlie** — First day on cycle with Abnormal, i switched from a 4 week cycle of deca durabolin x sustanon 250 over to Abnormal (2 pills a day) x sustanon 250 (1 pill a day). Effects are almost instant.', '2025-12-15T22:11:07Z', '2025-12-15T22:11:07Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, parent_id, body, created_at, updated_at)
VALUES ('e92d3324-871c-53da-a719-c788fe3c0ad0', 'd63ef879-07b6-5828-8bfd-81f4a28bc0b1', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '3dbda961-d03f-5f56-bf23-bf36b3ded9ec', '**Charlie** — Upped it to 3', '2025-12-18T07:00:28Z', '2025-12-18T07:00:28Z')
ON CONFLICT DO NOTHING;

-- === Anavar (2 comments) ===
INSERT INTO threads (id, room_id, author_id, title, body, created_at, updated_at)
VALUES ('5f1894b8-44cc-52b7-a044-24ab770bf647', '78547f3a-7322-46ff-8e42-db75b849bec1', 'fa7cdb88-8d9c-4a04-9b9e-cd6bc08f2aa9', 'Anavar - Community Discussion', 'Community discussion thread for Anavar. Drop your experience below.', NOW(), NOW())
ON CONFLICT DO NOTHING;
UPDATE compounds SET thread_id = '5f1894b8-44cc-52b7-a044-24ab770bf647' WHERE slug = 'anavar';

INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('cf9847fc-8235-57ec-8d45-60ac7f2344a9', '5f1894b8-44cc-52b7-a044-24ab770bf647', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '**Adam** — Just started this with enclo didn''''t look up ur video until I got it am I cooked?', '2025-07-01T18:08:21Z', '2025-07-01T18:08:21Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('f50d9d8b-7ae2-5de4-a730-e2de961d01fa', '5f1894b8-44cc-52b7-a044-24ab770bf647', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '**MikeyScars187** — 8 weeks cycle, worked well, even feeling no real lethargic feelings helped with body recomp on a keto style diet -- Stacked with Blackstone Methaquad recommended dosage', '2025-08-04T21:48:08Z', '2025-08-04T21:48:08Z')
ON CONFLICT DO NOTHING;

-- === Andriol (33 comments) ===
INSERT INTO threads (id, room_id, author_id, title, body, created_at, updated_at)
VALUES ('cf464777-fa1b-5003-8cc7-3591bed0340b', '78547f3a-7322-46ff-8e42-db75b849bec1', 'fa7cdb88-8d9c-4a04-9b9e-cd6bc08f2aa9', 'Andriol - Community Discussion', 'Community discussion thread for Andriol. Drop your experience below.', NOW(), NOW())
ON CONFLICT DO NOTHING;
UPDATE compounds SET thread_id = 'cf464777-fa1b-5003-8cc7-3591bed0340b' WHERE slug = 'andriol';

INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('ca428b00-21f4-5d87-b0bc-22441c3d44e9', 'cf464777-fa1b-5003-8cc7-3591bed0340b', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '**Matt Dillard** — This the jam!', '2025-05-26T01:40:56Z', '2025-05-26T01:40:56Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('ddacd12c-63c6-5812-b550-ce3421b0b709', 'cf464777-fa1b-5003-8cc7-3591bed0340b', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '**Chris Pope** — Starting Trenabol/Sus250 in a few days once it arrives! I love your content brother and was curios on your recommendation for dosing with the pros. Keep up the good work and dropping the knowledge!', '2025-05-26T21:56:16Z', '2025-05-26T21:56:16Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('e48248da-e450-504e-abc3-779ba2f1c260', 'cf464777-fa1b-5003-8cc7-3591bed0340b', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '**Trevor** — Can anyone who has ran Andriol let me know if you ran it with an AI? And did you experience any high estrogen sides?', '2025-05-26T23:15:54Z', '2025-05-26T23:15:54Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('840e4567-8616-5bcd-96e0-ea3f52079e1e', 'cf464777-fa1b-5003-8cc7-3591bed0340b', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '**Nick** — Why aren''''t the Steel supplements on here? Does Travis work for HTP?', '2025-06-06T18:41:47Z', '2025-06-06T18:41:47Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('a91d2d59-2c04-5e64-9f5a-1443ff517a3f', 'cf464777-fa1b-5003-8cc7-3591bed0340b', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '**Angelo** — Can I take both adriol and deca durabloin at the same time', '2025-07-08T00:07:25Z', '2025-07-08T00:07:25Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('b3f60d3a-c0fd-5ed2-9e21-9d476bdc0e52', 'cf464777-fa1b-5003-8cc7-3591bed0340b', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '**Dre** — Hey Travis, gonna be running Andriol and Sus250. 2 pill/day of Andriol and 1 pill/day of Sus250. Just wondering if you think it''''s worth while or if it''''s too much. Thanks brotha!', '2025-07-08T02:55:46Z', '2025-07-08T02:55:46Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('94d7908a-92af-5952-ba63-711deb07fc80', 'cf464777-fa1b-5003-8cc7-3591bed0340b', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '**Jeff** — Ran 1 tab for about a month then switched to 2 per day for 14 weeks total. It was my first Prohormone experience but it was very good. Strength increases, better mood, you will get some greasiness and acne, and some aggression. Didn''''t have any bloating or water retention problems.', '2025-07-27T02:42:07Z', '2025-07-27T02:42:07Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('19030213-4018-52c4-80bc-89a426068468', 'cf464777-fa1b-5003-8cc7-3591bed0340b', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '**colby** — is this the best prohormone for libido in your opinion?', '2025-08-03T13:51:38Z', '2025-08-03T13:51:38Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('843a0ced-8312-502b-aee3-791807d02ea8', 'cf464777-fa1b-5003-8cc7-3591bed0340b', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '**Zach** — Just completed my hi tech dymethazine and andriol stack. Definitely gained some vascularity. Veins are showing thru that I have never had before. I did lose some fat percent but I feel like it could have been better. My focus was cutting so I didn''''t see as much strength or size gains as I could have.', '2025-08-07T06:19:54Z', '2025-08-07T06:19:54Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('70a31450-5665-5e6d-bb0c-046618e48ed7', 'cf464777-fa1b-5003-8cc7-3591bed0340b', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '**Chris** — Can I take Andriol and Enclomiphene together?', '2025-08-30T00:46:48Z', '2025-08-30T00:46:48Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('3c7c7d28-5bf5-52bb-b8e8-bb87132aac0b', 'cf464777-fa1b-5003-8cc7-3591bed0340b', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '**Bobby** — Hello Has anyone have issues going through the bathroom or the pee turning extra yellow on Androil. Also anyone notice Having Kidney/Liver issues??', '2025-10-06T18:51:35Z', '2025-10-06T18:51:35Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('c726b5c8-3b6c-532f-8c01-7c002edaa109', 'cf464777-fa1b-5003-8cc7-3591bed0340b', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '**Mike S** — Thinking of running this with IBE Epistane to offset some test drops. Wonder if you''''d rec this or maybe an MK677 to go with it?', '2025-10-18T22:02:09Z', '2025-10-18T22:02:09Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('4ed173ef-27ee-51d9-8c2f-40a70ef7c005', 'cf464777-fa1b-5003-8cc7-3591bed0340b', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '**Garrett** — Can you stack Blackstone Labs Abnormal with this?', '2025-10-19T21:07:55Z', '2025-10-19T21:07:55Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('91ed8139-9828-53dc-9682-a0e035be8a22', 'cf464777-fa1b-5003-8cc7-3591bed0340b', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '**David** — Wanted to ask if it was ok to take andriol and dutasteride together. Dutasteride is for hair loss and it blocks DHT.', '2025-11-04T22:33:13Z', '2025-11-04T22:33:13Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('6eba01e4-b1e0-5df2-a64f-b203b3f0c24c', 'cf464777-fa1b-5003-8cc7-3591bed0340b', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '**OLDBLUE2** — I''''ve been running it for 30 days along with deca durability 1 tab daily of each. Bloodwork came back today, test is 37 and free testosterone is 4.8. I have a real problem can''''t blame these supps tho.', '2025-11-18T04:49:25Z', '2025-11-18T04:49:25Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('9c6c01c1-18cc-5d3d-9efb-f4bffbe9fe0c', 'cf464777-fa1b-5003-8cc7-3591bed0340b', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '**David** — Silly question. Could I take enclomiphene with Andriol', '2025-12-13T14:10:44Z', '2025-12-13T14:10:44Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, parent_id, body, created_at, updated_at)
VALUES ('2b578203-0d95-5646-97de-bd5b6218507e', 'cf464777-fa1b-5003-8cc7-3591bed0340b', 'fa7cdb88-8d9c-4a04-9b9e-cd6bc08f2aa9', 'e48248da-e450-504e-abc3-779ba2f1c260', 'I''''m on TRT and I typically take arimidex every 3 days and have been for years. When I run andriol, I toss in arimistane in once every 4 days on top. So for me slightly. Have had countless consultations with peeps who didn''''t need to run an AI at all. Either way, have it on hand, take it only if estro related side effects show up. Thanks for the comment and thanks for being here, broseph.', '2025-05-27T06:07:23Z', '2025-05-27T06:07:23Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, parent_id, body, created_at, updated_at)
VALUES ('6f4f0e20-7736-5cd3-9a2e-3206ab0163d5', 'cf464777-fa1b-5003-8cc7-3591bed0340b', 'd194f444-e2e0-59ee-b4df-b699e2d25307', 'e48248da-e450-504e-abc3-779ba2f1c260', '**DarkWolfe** — I''''m now ran Andriol 3 tabs day, without AI yet. 3rd week of cycle.', '2025-06-01T13:51:12Z', '2025-06-01T13:51:12Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, parent_id, body, created_at, updated_at)
VALUES ('1c53a811-4fa5-57ea-9382-03f469ec891a', 'cf464777-fa1b-5003-8cc7-3591bed0340b', 'fa7cdb88-8d9c-4a04-9b9e-cd6bc08f2aa9', '6f4f0e20-7736-5cd3-9a2e-3206ab0163d5', 'Some need one, some don''''t. Andriol is pretty mild and sustained leading to even keeled blood levels. This makes the ride smoother and keeps the side effects at bay. Thanks for the share brother!', '2025-06-01T19:49:36Z', '2025-06-01T19:49:36Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, parent_id, body, created_at, updated_at)
VALUES ('134398ba-51aa-5156-b3c1-4703b21ea9b7', 'cf464777-fa1b-5003-8cc7-3591bed0340b', 'd194f444-e2e0-59ee-b4df-b699e2d25307', 'e48248da-e450-504e-abc3-779ba2f1c260', '**Taylor** — I''''ve been on Andriol for 3 1/2 weeks now at 2 pills per day and due to some slight nipple sensitivity, I started 1 pill of arimistane every day (Sorry Travis lol). Now, the sensitivity is completely gone after 1 week.', '2025-06-04T19:52:14Z', '2025-06-04T19:52:14Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, parent_id, body, created_at, updated_at)
VALUES ('c76cafd3-8428-5074-8d05-5969d00b8ffe', 'cf464777-fa1b-5003-8cc7-3591bed0340b', 'fa7cdb88-8d9c-4a04-9b9e-cd6bc08f2aa9', '840e4567-8616-5bcd-96e0-ea3f52079e1e', 'Nope. Just covering what I believe to be the most effective products first. We will get to all of them though', '2025-06-07T02:51:30Z', '2025-06-07T02:51:30Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, parent_id, body, created_at, updated_at)
VALUES ('b10d662b-f83e-5e14-9294-d5c9f8b046bf', 'cf464777-fa1b-5003-8cc7-3591bed0340b', 'd194f444-e2e0-59ee-b4df-b699e2d25307', 'ddacd12c-63c6-5812-b550-ce3421b0b709', '**Jay** — Any updates?', '2025-06-19T22:56:25Z', '2025-06-19T22:56:25Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, parent_id, body, created_at, updated_at)
VALUES ('8e28df12-081b-533f-b5c4-21c1838cbb8a', 'cf464777-fa1b-5003-8cc7-3591bed0340b', 'fa7cdb88-8d9c-4a04-9b9e-cd6bc08f2aa9', 'ddacd12c-63c6-5812-b550-ce3421b0b709', '1 tab in the morning of each, 1 tab in the evening of each. How is it going for you brother?', '2025-06-25T13:42:14Z', '2025-06-25T13:42:14Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, parent_id, body, created_at, updated_at)
VALUES ('e95cd9ea-6eac-5534-b4f3-c42d93ac0048', 'cf464777-fa1b-5003-8cc7-3591bed0340b', 'd194f444-e2e0-59ee-b4df-b699e2d25307', 'a91d2d59-2c04-5e64-9f5a-1443ff517a3f', '**osamabinliftin** — yup! andriol at 2 a day might help boost libido and mood on deca dura', '2025-07-10T00:45:36Z', '2025-07-10T00:45:36Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, parent_id, body, created_at, updated_at)
VALUES ('41435ebd-4c27-59b3-92ed-6ef156e6b172', 'cf464777-fa1b-5003-8cc7-3591bed0340b', 'fa7cdb88-8d9c-4a04-9b9e-cd6bc08f2aa9', 'e95cd9ea-6eac-5534-b4f3-c42d93ac0048', 'Libido and mood should already be up from Andriol from the slight increase in estrogen, but decadura will certainly help to aid add some more intermuscular water to increase muscle belly size capacity and strength. Great combo there. Watch out for estro sides. Have arimistane on hand just in case!', '2025-08-01T05:27:19Z', '2025-08-01T05:27:19Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, parent_id, body, created_at, updated_at)
VALUES ('095d2adb-7c53-5f35-ad5a-2624a48abd6d', 'cf464777-fa1b-5003-8cc7-3591bed0340b', 'fa7cdb88-8d9c-4a04-9b9e-cd6bc08f2aa9', '19030213-4018-52c4-80bc-89a426068468', 'Sustanon 250 for me is def the best for libido', '2025-08-18T10:52:53Z', '2025-08-18T10:52:53Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, parent_id, body, created_at, updated_at)
VALUES ('c2a3395a-0a72-5173-97b4-35b3b757a630', 'cf464777-fa1b-5003-8cc7-3591bed0340b', 'fa7cdb88-8d9c-4a04-9b9e-cd6bc08f2aa9', '840e4567-8616-5bcd-96e0-ea3f52079e1e', 'haha, currently running vintage muscle, next up, lab ratting 3-AD. If I work for HTP, tell em to send me a raise. :)', '2025-07-31T23:24:30Z', '2025-07-31T23:24:30Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, parent_id, body, created_at, updated_at)
VALUES ('7cf8ae0d-d972-5693-9d38-c7c4edf4d9c3', 'cf464777-fa1b-5003-8cc7-3591bed0340b', 'fa7cdb88-8d9c-4a04-9b9e-cd6bc08f2aa9', 'b10d662b-f83e-5e14-9294-d5c9f8b046bf', 'Setting up an email system now so we can be informed when replies hit.', '2025-07-31T23:39:15Z', '2025-07-31T23:39:15Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, parent_id, body, created_at, updated_at)
VALUES ('2ae1d385-4790-5767-a711-39245295740b', 'cf464777-fa1b-5003-8cc7-3591bed0340b', 'd194f444-e2e0-59ee-b4df-b699e2d25307', 'e48248da-e450-504e-abc3-779ba2f1c260', '**Zo6427** — I am running with estrogenix. I usually get acne. 3 weeks in no acne. 1 pill andriol in the a.m.', '2025-09-06T14:05:10Z', '2025-09-06T14:05:10Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, parent_id, body, created_at, updated_at)
VALUES ('416a5d37-dad1-54bf-9ba7-e3161119dc05', 'cf464777-fa1b-5003-8cc7-3591bed0340b', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '3c7c7d28-5bf5-52bb-b8e8-bb87132aac0b', '**Jeff** — Are you drinking lots of water? Hope you''''re ok', '2025-10-19T23:44:43Z', '2025-10-19T23:44:43Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, parent_id, body, created_at, updated_at)
VALUES ('29d4b1a1-76ad-5599-b3e0-5b1c89265830', 'cf464777-fa1b-5003-8cc7-3591bed0340b', 'fa7cdb88-8d9c-4a04-9b9e-cd6bc08f2aa9', '6eba01e4-b1e0-5df2-a64f-b203b3f0c24c', 'Total T is 37? Serious feedback requiring action there, brother. I think you already know. Walking through life with concrete shoes ain''''t easy. Might be time to look into TRT.', '2025-11-18T15:55:19Z', '2025-11-18T15:55:19Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, parent_id, body, created_at, updated_at)
VALUES ('ab191c20-1daa-55d2-ac33-ae05be817900', 'cf464777-fa1b-5003-8cc7-3591bed0340b', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '29d4b1a1-76ad-5599-b3e0-5b1c89265830', '**OLDBLUE2** — Thanks professor I''''m on it. Keep doing what you''''re doing and I will get started with some test shots.', '2025-11-20T05:04:08Z', '2025-11-20T05:04:08Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, parent_id, body, created_at, updated_at)
VALUES ('89a99610-b6ce-59b5-9bde-64cf9ae7671e', 'cf464777-fa1b-5003-8cc7-3591bed0340b', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '9c6c01c1-18cc-5d3d-9efb-f4bffbe9fe0c', '**Ryan** — I''''m no pro but I would imagine the enclo would be pointless here with the way it tricks your brain to make more test. If there is already extra test there from the andriol I feel like the enclo would be wasted. (Not totally sure)', '2025-12-17T16:52:46Z', '2025-12-17T16:52:46Z')
ON CONFLICT DO NOTHING;

-- === Chosen-1 (11 comments) ===
INSERT INTO threads (id, room_id, author_id, title, body, created_at, updated_at)
VALUES ('5bdae252-9337-5e40-97cb-7081b98eb2cb', '78547f3a-7322-46ff-8e42-db75b849bec1', 'fa7cdb88-8d9c-4a04-9b9e-cd6bc08f2aa9', 'Chosen-1 - Community Discussion', 'Community discussion thread for Chosen-1. Drop your experience below.', NOW(), NOW())
ON CONFLICT DO NOTHING;
UPDATE compounds SET thread_id = '5bdae252-9337-5e40-97cb-7081b98eb2cb' WHERE slug = 'chosen-1';

INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('46e16628-9c79-5220-bd63-113498c4bc47', '5bdae252-9337-5e40-97cb-7081b98eb2cb', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '**Trevor** — Anyone ever try Steel Supps 1-andro? Looking for an alternative.', '2025-06-02T16:31:18Z', '2025-06-02T16:31:18Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('35a30766-73af-5255-b76d-4f857ac3c91a', '5bdae252-9337-5e40-97cb-7081b98eb2cb', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '**Nick** — Just wondering if I should run Arimiplex with this?', '2025-07-02T14:06:30Z', '2025-07-02T14:06:30Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('609e5672-9006-583b-92ea-dc5901321143', '5bdae252-9337-5e40-97cb-7081b98eb2cb', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '**nomad** — Ran this for six weeks, added decabolin the last two, had trouble peeing for a month. I am elderly.', '2025-08-22T15:29:38Z', '2025-08-22T15:29:38Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('a4f4ab5f-0c1b-564b-8979-f95ad7c29b4e', '5bdae252-9337-5e40-97cb-7081b98eb2cb', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '**Mark** — I''''ve tried quite a few different pro-hormones and this is still one of my favorites. You can tell a difference and not much of any sides to speak of.', '2025-09-07T03:07:43Z', '2025-09-07T03:07:43Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('c252c377-4f3a-59c0-82d8-38b3f3a9d2b1', '5bdae252-9337-5e40-97cb-7081b98eb2cb', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '**JUSTaDUDE** — So far in week 4/8. 33 yo male. Stacking with AbNORmal 2x a day with Chosen 1 at 2x a day. So far lost over 5 percent body fat, totaling around 15 pounds of fat. SMM went up about 4 lbs.', '2025-11-02T02:40:43Z', '2025-11-02T02:40:43Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('3dad90b3-5eb4-5433-8c91-aa4929d16b0a', '5bdae252-9337-5e40-97cb-7081b98eb2cb', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '**Karl S** — Andriol is fine. Decabolin, Ostiplex all good. But Chosen 1 gives me a severe itchy rash.', '2025-12-08T12:59:33Z', '2025-12-08T12:59:33Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, parent_id, body, created_at, updated_at)
VALUES ('a0c1c9d4-8df2-54ff-942a-e304f9e48b72', '5bdae252-9337-5e40-97cb-7081b98eb2cb', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '46e16628-9c79-5220-bd63-113498c4bc47', '**Adam** — Chosen1 is back.', '2025-06-04T13:36:08Z', '2025-06-04T13:36:08Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, parent_id, body, created_at, updated_at)
VALUES ('2c66b092-3e9c-5d66-a279-fc36b91478f8', '5bdae252-9337-5e40-97cb-7081b98eb2cb', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '46e16628-9c79-5220-bd63-113498c4bc47', '**Dre** — I actually started my pro-hormone journey with STEEL and while I didn''''t have any problems I do feel like the other products give a bigger bang for the buck.', '2025-07-08T03:02:02Z', '2025-07-08T03:02:02Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, parent_id, body, created_at, updated_at)
VALUES ('c7b8a6a9-0a59-5e3d-9697-1c6984096878', '5bdae252-9337-5e40-97cb-7081b98eb2cb', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '35a30766-73af-5255-b76d-4f857ac3c91a', '**Jimmy** — Currently running first 4 weeks Chosen1 and Superdrol7 with liver rx', '2025-09-09T10:10:10Z', '2025-09-09T10:10:10Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, parent_id, body, created_at, updated_at)
VALUES ('6c815547-368c-5943-a629-441d828b07f2', '5bdae252-9337-5e40-97cb-7081b98eb2cb', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '35a30766-73af-5255-b76d-4f857ac3c91a', '**JUSTaDUDE** — I think Travis said to just keep it on hand incase after the 2 step conversion that things get a little out of control.', '2025-11-02T02:42:49Z', '2025-11-02T02:42:49Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, parent_id, body, created_at, updated_at)
VALUES ('24d32d80-6334-5306-a167-036379ac79ab', '5bdae252-9337-5e40-97cb-7081b98eb2cb', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '3dad90b3-5eb4-5433-8c91-aa4929d16b0a', '**Talib - Same Day Supps** — I have heard the same thing with others.', '2025-12-09T21:59:40Z', '2025-12-09T21:59:40Z')
ON CONFLICT DO NOTHING;

-- === Deca-Durabolin (10 comments) ===
INSERT INTO threads (id, room_id, author_id, title, body, created_at, updated_at)
VALUES ('7c6de625-5a04-5389-8552-359847b74056', '78547f3a-7322-46ff-8e42-db75b849bec1', 'fa7cdb88-8d9c-4a04-9b9e-cd6bc08f2aa9', 'Deca-Durabolin - Community Discussion', 'Community discussion thread for Deca-Durabolin. Drop your experience below.', NOW(), NOW())
ON CONFLICT DO NOTHING;
UPDATE compounds SET thread_id = '7c6de625-5a04-5389-8552-359847b74056' WHERE slug = 'deca-durabolin';

INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('664509c7-baae-5c58-bfaf-74b9c9f592c5', '7c6de625-5a04-5389-8552-359847b74056', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '**Andy** — Ran deca with 1test. Did have some gains. But mood and libido were awful. Will have to try again with a 4andro', '2025-05-29T22:36:10Z', '2025-05-29T22:36:10Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('ece81dee-a18e-54b3-a1a1-aad8032b2a65', '7c6de625-5a04-5389-8552-359847b74056', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '**Taylor** — Libido issues make Deca Durabolin not worth it for me, even while running it with a 4 Andro (Andriol).', '2025-06-05T13:00:07Z', '2025-06-05T13:00:07Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('c1e69139-3c3e-594d-b3cf-6339cd7ff5a1', '7c6de625-5a04-5389-8552-359847b74056', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '**PHil** — I''''m deca durabolin equipoise and sustanon 250 what should I pct with', '2025-06-20T01:12:45Z', '2025-06-20T01:12:45Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('a2c95d3e-e15a-509a-9dff-c4903dcb6ac2', '7c6de625-5a04-5389-8552-359847b74056', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '**Jeff** — 4 weeks 1 tab a day with Andriol at 2 tabs a day. Did experience strength increase after about a week to 10 days. Did also have some sporadic anger events.', '2025-07-27T02:26:58Z', '2025-07-27T02:26:58Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('fa8cc5c5-9ec3-528b-9ad6-5f8abe24b37d', '7c6de625-5a04-5389-8552-359847b74056', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '**WANKO** — Did a 2 month run of this finished and am unsure if I need to pct immediately after or wait', '2025-09-04T12:16:59Z', '2025-09-04T12:16:59Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('c09bd790-0b34-5d8b-9c1b-a10ddacc1aea', '7c6de625-5a04-5389-8552-359847b74056', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '**Ronnie** — No side effects yet, just strength and size gain. On second week, added andriol 4 andro for the stack.', '2025-10-17T23:53:46Z', '2025-10-17T23:53:46Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('d70fa970-17d1-5d88-8860-5b7d9a7b8e13', '7c6de625-5a04-5389-8552-359847b74056', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '**Daniel** — Can I take this with trenabol and andriol?', '2025-11-05T15:44:51Z', '2025-11-05T15:44:51Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, parent_id, body, created_at, updated_at)
VALUES ('738e4a0e-98fe-56f5-b625-04f04e858c36', '7c6de625-5a04-5389-8552-359847b74056', 'd194f444-e2e0-59ee-b4df-b699e2d25307', 'ece81dee-a18e-54b3-a1a1-aad8032b2a65', '**Kyle** — Did you finish your cycle? and if so what were the results like?', '2025-07-21T20:05:38Z', '2025-07-21T20:05:38Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, parent_id, body, created_at, updated_at)
VALUES ('713f70ad-7f21-59a9-8021-8432d2445bb1', '7c6de625-5a04-5389-8552-359847b74056', 'd194f444-e2e0-59ee-b4df-b699e2d25307', 'c09bd790-0b34-5d8b-9c1b-a10ddacc1aea', '**Ronnie** — forgot to mention major vascularity.', '2025-10-17T23:56:21Z', '2025-10-17T23:56:21Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, parent_id, body, created_at, updated_at)
VALUES ('08ae7a83-fd05-5a59-bbfc-abbeea6981aa', '7c6de625-5a04-5389-8552-359847b74056', 'd194f444-e2e0-59ee-b4df-b699e2d25307', 'd70fa970-17d1-5d88-8860-5b7d9a7b8e13', '**Talib - Same Day Supplements** — It is very common to stack Andriol with Decadurabolin or Trenabol to utilize 19-nors joint-lubricating benefits. However, stacking two 19-Nors alongside Andriol would be a heavy, advanced stack.', '2025-12-09T22:02:33Z', '2025-12-09T22:02:33Z')
ON CONFLICT DO NOTHING;

-- === Decabolin (6 comments) ===
INSERT INTO threads (id, room_id, author_id, title, body, created_at, updated_at)
VALUES ('eb0346a8-5089-5a95-94bf-19ba1640df72', '78547f3a-7322-46ff-8e42-db75b849bec1', 'fa7cdb88-8d9c-4a04-9b9e-cd6bc08f2aa9', 'Decabolin - Community Discussion', 'Community discussion thread for Decabolin. Drop your experience below.', NOW(), NOW())
ON CONFLICT DO NOTHING;
UPDATE compounds SET thread_id = 'eb0346a8-5089-5a95-94bf-19ba1640df72' WHERE slug = 'decabolin';

INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('84320a5f-403c-559b-9490-3cb79a56b59e', 'eb0346a8-5089-5a95-94bf-19ba1640df72', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '**Miles** — Ran this as well as 1-testosterone a few months back. Actually started with two weeks of just 1-testosterone then added in two pills a day of decabolin. Within a few days I noticed gradual improvements in strength. Also decrease in joint pain. This is something I will continue to use in upcoming cycle one of my favs!', '2025-05-31T11:34:42Z', '2025-05-31T11:34:42Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('fe970c1f-2f84-568d-ae44-88adc2c81792', 'eb0346a8-5089-5a95-94bf-19ba1640df72', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '**Nick** — Do I need to run a 1 test with this? Or can this be used as a stand alone?', '2025-07-02T14:21:45Z', '2025-07-02T14:21:45Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('15deee53-5e17-50ff-ac86-9ce666c29e5e', 'eb0346a8-5089-5a95-94bf-19ba1640df72', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '**1-test and deca first cycle** — Just starting second week 1 pill each feel like my estrogen is increasing. Felt powerful being on a cut. This week I''''m dog tired.', '2025-07-03T00:05:49Z', '2025-07-03T00:05:49Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('72342687-631f-54a2-90eb-2764a7e8927a', 'eb0346a8-5089-5a95-94bf-19ba1640df72', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '**Joe** — Can I take this by itself?', '2025-12-13T00:19:23Z', '2025-12-13T00:19:23Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, parent_id, body, created_at, updated_at)
VALUES ('6f9eb91f-58e8-5d85-acea-9ed67089fdec', 'eb0346a8-5089-5a95-94bf-19ba1640df72', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '84320a5f-403c-559b-9490-3cb79a56b59e', '**Miles** — Correction *decabolin not decadurabolin', '2025-05-31T11:36:37Z', '2025-05-31T11:36:37Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, parent_id, body, created_at, updated_at)
VALUES ('17df421d-638b-59ac-9faf-39db48210555', 'eb0346a8-5089-5a95-94bf-19ba1640df72', 'd194f444-e2e0-59ee-b4df-b699e2d25307', 'fe970c1f-2f84-568d-ae44-88adc2c81792', '**Joe** — Did you end up running it by itself?', '2025-12-13T00:23:19Z', '2025-12-13T00:23:19Z')
ON CONFLICT DO NOTHING;

-- === Dymethazine (8 comments) ===
INSERT INTO threads (id, room_id, author_id, title, body, created_at, updated_at)
VALUES ('fee2345b-6cde-5cb9-9e17-a8659ffe9765', '78547f3a-7322-46ff-8e42-db75b849bec1', 'fa7cdb88-8d9c-4a04-9b9e-cd6bc08f2aa9', 'Dymethazine - Community Discussion', 'Community discussion thread for Dymethazine. Drop your experience below.', NOW(), NOW())
ON CONFLICT DO NOTHING;
UPDATE compounds SET thread_id = 'fee2345b-6cde-5cb9-9e17-a8659ffe9765' WHERE slug = 'dymethazine';

INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('82a04225-6eab-5f29-8ad3-7a18f5021aaf', 'fee2345b-6cde-5cb9-9e17-a8659ffe9765', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '**Monet34** — I have been on dymethazine for 7 weeks and I feel great on it I''''ve lost a lot of body fat and my muscle hardness has increased and it also has given me insane vascularity.', '2025-07-07T20:26:23Z', '2025-07-07T20:26:23Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('9c4e8bcc-334a-5104-b9a0-d91171c3c892', 'fee2345b-6cde-5cb9-9e17-a8659ffe9765', 'fa7cdb88-8d9c-4a04-9b9e-cd6bc08f2aa9', 'You didn''''t need any arimistane for epiandro I''''m assuming?', '2025-07-22T19:53:40Z', '2025-07-22T19:53:40Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('32ad5af8-9da9-5716-b1e7-2320bb073cf1', 'fee2345b-6cde-5cb9-9e17-a8659ffe9765', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '**Jeff** — I completed an 8 week cycle of Dymethazine (stand alone) and had decent results. My goal was to cut fat and I went from 198lbs with 18%% body fat to 187 lbs with 16%% body fat.', '2025-08-03T00:36:08Z', '2025-08-03T00:36:08Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('a48e1735-9014-501d-ab1c-1dfe991749fe', 'fee2345b-6cde-5cb9-9e17-a8659ffe9765', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '**Zach** — Just completed my hi tech dymethazine and andriol stack. Definitely gained some vascularity.', '2025-08-07T06:23:51Z', '2025-08-07T06:23:51Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('9b2365cd-2ea3-5eb0-b0ff-2053c7c96100', 'fee2345b-6cde-5cb9-9e17-a8659ffe9765', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '**Paul** — I did an 8 week cycle of dymethazine stacked with another prohormone. Let me say dymethazine is the real deal. The pumps I got on this compound were insane.', '2025-09-27T04:36:54Z', '2025-09-27T04:36:54Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, parent_id, body, created_at, updated_at)
VALUES ('803e55ac-f7a9-5087-b250-8e04591c27b0', 'fee2345b-6cde-5cb9-9e17-a8659ffe9765', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '82a04225-6eab-5f29-8ad3-7a18f5021aaf', '**AK40** — Did you have any bloat, or seeing any hair loss?', '2025-07-14T08:40:00Z', '2025-07-14T08:40:00Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, parent_id, body, created_at, updated_at)
VALUES ('1342b236-bd60-5f23-b2a8-ada26e6b6aba', 'fee2345b-6cde-5cb9-9e17-a8659ffe9765', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '9c4e8bcc-334a-5104-b9a0-d91171c3c892', '**Monet34** — No I did not use Arimistane for this particular cycle at all. I had some trouble sleeping at night, but I slowly slept better after the first 2 weeks. I''''m 51 years old taking real gear before when I was 31.', '2025-07-24T03:10:25Z', '2025-07-24T03:10:25Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, parent_id, body, created_at, updated_at)
VALUES ('8e3a258e-3aa1-5b72-9738-8e5926e96641', 'fee2345b-6cde-5cb9-9e17-a8659ffe9765', 'd194f444-e2e0-59ee-b4df-b699e2d25307', 'a48e1735-9014-501d-ab1c-1dfe991749fe', '**Zach** — Also I did have back pumps. One which was pretty noticeable and long lasting.', '2025-08-07T06:25:59Z', '2025-08-07T06:25:59Z')
ON CONFLICT DO NOTHING;

-- === Enclomiphene (1 comments) ===
INSERT INTO threads (id, room_id, author_id, title, body, created_at, updated_at)
VALUES ('2b8f7924-decd-508c-9eee-866bb9239513', '78547f3a-7322-46ff-8e42-db75b849bec1', 'fa7cdb88-8d9c-4a04-9b9e-cd6bc08f2aa9', 'Enclomiphene - Community Discussion', 'Community discussion thread for Enclomiphene. Drop your experience below.', NOW(), NOW())
ON CONFLICT DO NOTHING;
UPDATE compounds SET thread_id = '2b8f7924-decd-508c-9eee-866bb9239513' WHERE slug = 'enclomiphene';

INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('d28e0be3-75c8-5d30-9155-b3c6a2f7f3ef', '2b8f7924-decd-508c-9eee-866bb9239513', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '**Joseph** — Ran for 12 weeks at 6.25mg for 8 weeks than 12.5mg for 4 more weeks. Ended up with eye floaters.', '2025-06-05T03:31:04Z', '2025-06-05T03:31:04Z')
ON CONFLICT DO NOTHING;

-- === Equipoise (2 comments) ===
INSERT INTO threads (id, room_id, author_id, title, body, created_at, updated_at)
VALUES ('c869ac9a-91c0-5a1e-8297-3d4e4165e999', '78547f3a-7322-46ff-8e42-db75b849bec1', 'fa7cdb88-8d9c-4a04-9b9e-cd6bc08f2aa9', 'Equipoise - Community Discussion', 'Community discussion thread for Equipoise. Drop your experience below.', NOW(), NOW())
ON CONFLICT DO NOTHING;
UPDATE compounds SET thread_id = 'c869ac9a-91c0-5a1e-8297-3d4e4165e999' WHERE slug = 'equipoise';

INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('b39cb539-d9b2-580d-bd3b-b07ada1c8f1a', 'c869ac9a-91c0-5a1e-8297-3d4e4165e999', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '**Jake** — 8 week cycle - 2 bottles, 2 pills. Started at 138lbs and end weight was 161lbs. The effects were a dry effect lean mass gained.', '2025-07-03T22:40:26Z', '2025-07-03T22:40:26Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, parent_id, body, created_at, updated_at)
VALUES ('d10fb3fd-22d6-5731-a81e-e855e5c1b678', 'c869ac9a-91c0-5a1e-8297-3d4e4165e999', 'd194f444-e2e0-59ee-b4df-b699e2d25307', 'b39cb539-d9b2-580d-bd3b-b07ada1c8f1a', '**Jay** — From the sounds of it, it looks like you''''re more prone to the high estrogen side than the average.', '2025-08-11T06:11:58Z', '2025-08-11T06:11:58Z')
ON CONFLICT DO NOTHING;

-- === Halo Elite (2 comments) ===
INSERT INTO threads (id, room_id, author_id, title, body, created_at, updated_at)
VALUES ('52145b1c-c896-5dab-bac6-7e8efb825425', '78547f3a-7322-46ff-8e42-db75b849bec1', 'fa7cdb88-8d9c-4a04-9b9e-cd6bc08f2aa9', 'Halo Elite - Community Discussion', 'Community discussion thread for Halo Elite. Drop your experience below.', NOW(), NOW())
ON CONFLICT DO NOTHING;
UPDATE compounds SET thread_id = '52145b1c-c896-5dab-bac6-7e8efb825425' WHERE slug = 'halo-elite';

INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('7e5247dc-e56f-5b86-a9a7-00866a59a2ef', '52145b1c-c896-5dab-bac6-7e8efb825425', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '**Weston woods** — I''''ve done 8 week cycles and I''''ve done one 12 week cycle of Halo Elite from blackstone labs at 3 pills a day. Noticed my aggression in the gym increased along with dry muscle gains.', '2025-06-01T19:33:11Z', '2025-06-01T19:33:11Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('b949e962-9e78-5b42-9249-5d18305ba70e', '52145b1c-c896-5dab-bac6-7e8efb825425', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '**nomad** — Did a four week cycle. No sides, but I don''''t think this is any better than tongkat ali. Very overpriced.', '2025-08-22T15:22:51Z', '2025-08-22T15:22:51Z')
ON CONFLICT DO NOTHING;

-- === Halodrol (4 comments) ===
INSERT INTO threads (id, room_id, author_id, title, body, created_at, updated_at)
VALUES ('c67ad5ab-27d6-56e1-8f2f-b8d8295262e6', '78547f3a-7322-46ff-8e42-db75b849bec1', 'fa7cdb88-8d9c-4a04-9b9e-cd6bc08f2aa9', 'Halodrol - Community Discussion', 'Community discussion thread for Halodrol. Drop your experience below.', NOW(), NOW())
ON CONFLICT DO NOTHING;
UPDATE compounds SET thread_id = 'c67ad5ab-27d6-56e1-8f2f-b8d8295262e6' WHERE slug = 'halodrol';

INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('3563adeb-2ab3-5a1c-8297-99e100279987', 'c67ad5ab-27d6-56e1-8f2f-b8d8295262e6', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '**DarkWolfe** — Review: Halodrol + Andriol + Pro IGF-1 Stack by Hi-Tech Pharmaceuticals. Cycle Duration: 8 weeks. Dosage: Halodrol - 2 tablets/day, Andriol - 2 tablets/day (with fatty food), Pro IGF-1 - 4 tablets/day.', '2025-05-25T07:06:08Z', '2025-05-25T07:06:08Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('e9c155c2-0bfe-5527-88a7-dae9b0a5f98b', 'c67ad5ab-27d6-56e1-8f2f-b8d8295262e6', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '**Colby** — If taking single dose per day to start with plans for a 2 month cycle is DIM sufficient for monitoring estrogen?', '2025-08-07T12:31:25Z', '2025-08-07T12:31:25Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('d686f142-ae9b-5183-97d8-ac7dd1b924dd', 'c67ad5ab-27d6-56e1-8f2f-b8d8295262e6', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '**Cody** — Hi I was recommended halodrol with dymethazine and either sustanon 250 or andriol for eating at maintenance calories at my weight class for powerlifting. Was that ideal?', '2025-09-14T04:47:28Z', '2025-09-14T04:47:28Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, parent_id, body, created_at, updated_at)
VALUES ('0875fc21-7d5a-579e-b96b-81bc0ef49f67', 'c67ad5ab-27d6-56e1-8f2f-b8d8295262e6', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '3563adeb-2ab3-5a1c-8297-99e100279987', '**Joe** — Thanks for this bro, very helpful!', '2025-11-25T03:48:19Z', '2025-11-25T03:48:19Z')
ON CONFLICT DO NOTHING;

-- === Halotestin (3 comments) ===
INSERT INTO threads (id, room_id, author_id, title, body, created_at, updated_at)
VALUES ('d145a5df-bea2-5ac5-92d7-f110e733272c', '78547f3a-7322-46ff-8e42-db75b849bec1', 'fa7cdb88-8d9c-4a04-9b9e-cd6bc08f2aa9', 'Halotestin - Community Discussion', 'Community discussion thread for Halotestin. Drop your experience below.', NOW(), NOW())
ON CONFLICT DO NOTHING;
UPDATE compounds SET thread_id = 'd145a5df-bea2-5ac5-92d7-f110e733272c' WHERE slug = 'halotestin';

INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('947dd55e-4b06-5271-8c30-0ccdd7b3636e', 'd145a5df-bea2-5ac5-92d7-f110e733272c', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '**Jadon** — Gonna pop my cherry with this one at 16', '2025-08-15T05:45:43Z', '2025-08-15T05:45:43Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, parent_id, body, created_at, updated_at)
VALUES ('f6f4e5ba-ebe6-5776-9e26-129deb25ff1e', 'd145a5df-bea2-5ac5-92d7-f110e733272c', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '947dd55e-4b06-5271-8c30-0ccdd7b3636e', '**mad killer** — this is a joke right jadon lol', '2025-08-26T21:43:04Z', '2025-08-26T21:43:04Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, parent_id, body, created_at, updated_at)
VALUES ('8125cde1-d40f-5f0e-a955-6cba13f4d132', 'd145a5df-bea2-5ac5-92d7-f110e733272c', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '947dd55e-4b06-5271-8c30-0ccdd7b3636e', '**Jeff** — I hope you don''''t at 16', '2025-10-20T00:06:44Z', '2025-10-20T00:06:44Z')
ON CONFLICT DO NOTHING;

-- === Methaquad (1 comments) ===
INSERT INTO threads (id, room_id, author_id, title, body, created_at, updated_at)
VALUES ('02c95444-3011-5f33-9d5a-61eb54d153be', '78547f3a-7322-46ff-8e42-db75b849bec1', 'fa7cdb88-8d9c-4a04-9b9e-cd6bc08f2aa9', 'Methaquad - Community Discussion', 'Community discussion thread for Methaquad. Drop your experience below.', NOW(), NOW())
ON CONFLICT DO NOTHING;
UPDATE compounds SET thread_id = '02c95444-3011-5f33-9d5a-61eb54d153be' WHERE slug = 'methaquad';

INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('1bc7ae6b-c4aa-58f9-aa5b-125134992299', '02c95444-3011-5f33-9d5a-61eb54d153be', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '**Trent** — Ran a few cycles of Methaquad. Solid, keepable gains in mass, on cycle strength is great. I felt lethargic, water bloat, and hungry. Definitely increases competitive aggression for the gym.', '2025-07-01T12:54:48Z', '2025-07-01T12:54:48Z')
ON CONFLICT DO NOTHING;

-- === Methylene Blue (1 comments) ===
INSERT INTO threads (id, room_id, author_id, title, body, created_at, updated_at)
VALUES ('a9cf5272-5452-5970-9cc2-b5f2dfd41daf', '78547f3a-7322-46ff-8e42-db75b849bec1', 'fa7cdb88-8d9c-4a04-9b9e-cd6bc08f2aa9', 'Methylene Blue - Community Discussion', 'Community discussion thread for Methylene Blue. Drop your experience below.', NOW(), NOW())
ON CONFLICT DO NOTHING;
UPDATE compounds SET thread_id = 'a9cf5272-5452-5970-9cc2-b5f2dfd41daf' WHERE slug = 'methylene-blue';

INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('1ecda3ee-5cbf-59e8-a87b-94cf102b6345', 'a9cf5272-5452-5970-9cc2-b5f2dfd41daf', 'fa7cdb88-8d9c-4a04-9b9e-cd6bc08f2aa9', 'Now that ain''''t productive. Expand brother. If not. why not?', '2025-11-18T17:53:22Z', '2025-11-18T17:53:22Z')
ON CONFLICT DO NOTHING;

-- === MK-677 (1 comments) ===
INSERT INTO threads (id, room_id, author_id, title, body, created_at, updated_at)
VALUES ('62830333-86c8-5713-b561-0b247eb5a7bd', '78547f3a-7322-46ff-8e42-db75b849bec1', 'fa7cdb88-8d9c-4a04-9b9e-cd6bc08f2aa9', 'MK-677 - Community Discussion', 'Community discussion thread for MK-677. Drop your experience below.', NOW(), NOW())
ON CONFLICT DO NOTHING;
UPDATE compounds SET thread_id = '62830333-86c8-5713-b561-0b247eb5a7bd' WHERE slug = 'mk-677';

INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('6b693aa1-5f08-528b-9bab-ec3b482f84ae', '62830333-86c8-5713-b561-0b247eb5a7bd', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '**Medicine Man** — Great information and breakdown. The only thing; I do not see Arimiplex listed.', '2025-08-14T12:26:29Z', '2025-08-14T12:26:29Z')
ON CONFLICT DO NOTHING;

-- === Monsterplexx (6 comments) ===
INSERT INTO threads (id, room_id, author_id, title, body, created_at, updated_at)
VALUES ('6723de5c-e25c-57b9-8e1a-16f5925ace59', '78547f3a-7322-46ff-8e42-db75b849bec1', 'fa7cdb88-8d9c-4a04-9b9e-cd6bc08f2aa9', 'Monsterplexx - Community Discussion', 'Community discussion thread for Monsterplexx. Drop your experience below.', NOW(), NOW())
ON CONFLICT DO NOTHING;
UPDATE compounds SET thread_id = '6723de5c-e25c-57b9-8e1a-16f5925ace59' WHERE slug = 'monsterplexx';

INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('bcdf500b-42b2-56fc-b854-213cb9b57b25', '6723de5c-e25c-57b9-8e1a-16f5925ace59', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '**Bigdog808** — Going to be finishing up a 8 week cycle of Monsterplexx. I have Enclomiphine on hand. I was wondering if there is anything else I could ad in to help keep and maintain gains', '2025-06-06T06:00:14Z', '2025-06-06T06:00:14Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('d29d2ad0-8af0-53d9-b36c-4bdf482586d0', '6723de5c-e25c-57b9-8e1a-16f5925ace59', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '**Robert** — I noticed the recommended dosage on this site for Monster Plexx is 1 pill per day. Why?', '2025-08-02T00:35:35Z', '2025-08-02T00:35:35Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('0d365d85-9ae5-5036-a55e-9e6bda50db49', '6723de5c-e25c-57b9-8e1a-16f5925ace59', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '**matt** — ive taken 3 pills for 8 weeks i gained about 15-20lbs i had no sides, used arimiplex and apex male for pct.', '2025-11-18T01:45:17Z', '2025-11-18T01:45:17Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('f7ce7d36-575a-5105-b402-7b69ae55c9a4', '6723de5c-e25c-57b9-8e1a-16f5925ace59', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '**Joel** — Hope to put on at least 10 pounds of muscle running this, and see if the hype is real.', '2025-12-19T15:58:03Z', '2025-12-19T15:58:03Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, parent_id, body, created_at, updated_at)
VALUES ('f4d6442c-3fd6-56db-855d-3ccc4ffdf5f5', '6723de5c-e25c-57b9-8e1a-16f5925ace59', 'd194f444-e2e0-59ee-b4df-b699e2d25307', 'd29d2ad0-8af0-53d9-b36c-4bdf482586d0', '**Andy** — I''''d plan for 2 pills. He always says to start with 1 to judge your side effects. But 1 pill might do absolutely nothing for you', '2025-09-11T15:30:04Z', '2025-09-11T15:30:04Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, parent_id, body, created_at, updated_at)
VALUES ('973bc76d-f69d-545e-9ebe-a9bd720f4b78', '6723de5c-e25c-57b9-8e1a-16f5925ace59', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '0d365d85-9ae5-5036-a55e-9e6bda50db49', '**Andy** — Currently running 3 pills with deca. Super dry together. I had to toss in brutal 4ace to help keep test and estrogen up.', '2025-11-18T16:25:46Z', '2025-11-18T16:25:46Z')
ON CONFLICT DO NOTHING;

-- === Ostaplex (1 comments) ===
INSERT INTO threads (id, room_id, author_id, title, body, created_at, updated_at)
VALUES ('e57ba35f-c74f-5a8b-9d55-a8476909bcfd', '78547f3a-7322-46ff-8e42-db75b849bec1', 'fa7cdb88-8d9c-4a04-9b9e-cd6bc08f2aa9', 'Ostaplex - Community Discussion', 'Community discussion thread for Ostaplex. Drop your experience below.', NOW(), NOW())
ON CONFLICT DO NOTHING;
UPDATE compounds SET thread_id = 'e57ba35f-c74f-5a8b-9d55-a8476909bcfd' WHERE slug = 'ostaplex';

INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('4280df81-8181-586f-91a5-1273c9ff1cce', 'e57ba35f-c74f-5a8b-9d55-a8476909bcfd', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '**Nomad** — I been running Andriol for four weeks, added Osti-plex last week. Two tabs a day of each. So far so good. Got some size and no side effects. Travis thank you for all your content, and congratulations to you and your wife.', '2025-09-12T10:41:47Z', '2025-09-12T10:41:47Z')
ON CONFLICT DO NOTHING;

-- === Pink Magic (2 comments) ===
INSERT INTO threads (id, room_id, author_id, title, body, created_at, updated_at)
VALUES ('26540085-7e13-51d6-8bd7-9355ddd0dc69', '78547f3a-7322-46ff-8e42-db75b849bec1', 'fa7cdb88-8d9c-4a04-9b9e-cd6bc08f2aa9', 'Pink Magic - Community Discussion', 'Community discussion thread for Pink Magic. Drop your experience below.', NOW(), NOW())
ON CONFLICT DO NOTHING;
UPDATE compounds SET thread_id = '26540085-7e13-51d6-8bd7-9355ddd0dc69' WHERE slug = 'pink-magic';

INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('9b3f0e23-8eff-5cd9-b520-30fbb3c94d4f', '26540085-7e13-51d6-8bd7-9355ddd0dc69', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '**Pink** — I am currently in my seventh week of taking the product and will extend it to twelve. The gains are good while the muscle strength is excellent as well as the definition, the libido is excellent.', '2025-07-02T21:53:22Z', '2025-07-02T21:53:22Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('e2b877ae-ebeb-514a-8f58-31e427cc92a0', '26540085-7e13-51d6-8bd7-9355ddd0dc69', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '**Pink** — I take it three in the morning and three at night.', '2025-07-02T21:54:43Z', '2025-07-02T21:54:43Z')
ON CONFLICT DO NOTHING;

-- === Primobolan (2 comments) ===
INSERT INTO threads (id, room_id, author_id, title, body, created_at, updated_at)
VALUES ('ab533def-d1d0-5d37-bc6f-980ad9c2df93', '78547f3a-7322-46ff-8e42-db75b849bec1', 'fa7cdb88-8d9c-4a04-9b9e-cd6bc08f2aa9', 'Primobolan - Community Discussion', 'Community discussion thread for Primobolan. Drop your experience below.', NOW(), NOW())
ON CONFLICT DO NOTHING;
UPDATE compounds SET thread_id = 'ab533def-d1d0-5d37-bc6f-980ad9c2df93' WHERE slug = 'primobolan';

INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('1e2e7733-2124-524b-97d0-541886b9bb7d', 'ab533def-d1d0-5d37-bc6f-980ad9c2df93', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '**TheGorillaSlowedCumbias** — Hi! What would happen if I only took the prescribed dose 5 days a week instead of 7?', '2025-11-13T08:51:03Z', '2025-11-13T08:51:03Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('50a5a72a-7adf-5170-8bbd-5bc323ac2ff1', 'ab533def-d1d0-5d37-bc6f-980ad9c2df93', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '**Jonatan Anaya** — Hi everyone! Why using product, I lost Size? I noticed I lost fat, but also size.', '2025-12-23T01:55:14Z', '2025-12-23T01:55:14Z')
ON CONFLICT DO NOTHING;

-- === Superdrol (1 comments) ===
INSERT INTO threads (id, room_id, author_id, title, body, created_at, updated_at)
VALUES ('18cd8607-8522-554b-9c47-182b30a48473', '78547f3a-7322-46ff-8e42-db75b849bec1', 'fa7cdb88-8d9c-4a04-9b9e-cd6bc08f2aa9', 'Superdrol - Community Discussion', 'Community discussion thread for Superdrol. Drop your experience below.', NOW(), NOW())
ON CONFLICT DO NOTHING;
UPDATE compounds SET thread_id = '18cd8607-8522-554b-9c47-182b30a48473' WHERE slug = 'superdrol';

INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('a1360187-fa7f-51f9-a4fc-49aaa12a752a', '18cd8607-8522-554b-9c47-182b30a48473', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '**Paul** — Even though it is banned I love this stuff. It did make me lethargic but in the gym it gave me pumps like I''''ve never experienced in my life.', '2025-09-27T05:26:20Z', '2025-09-27T05:26:20Z')
ON CONFLICT DO NOTHING;

-- === Superstrol-7 (2 comments) ===
INSERT INTO threads (id, room_id, author_id, title, body, created_at, updated_at)
VALUES ('7d2ac9e8-c48c-5db6-b60f-99a0a7b9f8b7', '78547f3a-7322-46ff-8e42-db75b849bec1', 'fa7cdb88-8d9c-4a04-9b9e-cd6bc08f2aa9', 'Superstrol-7 - Community Discussion', 'Community discussion thread for Superstrol-7. Drop your experience below.', NOW(), NOW())
ON CONFLICT DO NOTHING;
UPDATE compounds SET thread_id = '7d2ac9e8-c48c-5db6-b60f-99a0a7b9f8b7' WHERE slug = 'superstrol-7';

INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('04fe4e6e-9bca-5be3-9dbb-d4b4bae5607c', '7d2ac9e8-c48c-5db6-b60f-99a0a7b9f8b7', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '**John** — Would andriol be a good stack with superstrol?', '2025-08-26T03:42:46Z', '2025-08-26T03:42:46Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, parent_id, body, created_at, updated_at)
VALUES ('8d8b3ba6-34df-571a-a2e9-5d93cb57eac8', '7d2ac9e8-c48c-5db6-b60f-99a0a7b9f8b7', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '04fe4e6e-9bca-5be3-9dbb-d4b4bae5607c', '**Jimmy** — in his past videos he said monster plex or chosen1 to stack with this.', '2025-09-09T10:12:16Z', '2025-09-09T10:12:16Z')
ON CONFLICT DO NOTHING;

-- === Sustanon 250 (10 comments) ===
INSERT INTO threads (id, room_id, author_id, title, body, created_at, updated_at)
VALUES ('8c6cbbed-0a56-5e5c-9dcf-afbdc9dba5d2', '78547f3a-7322-46ff-8e42-db75b849bec1', 'fa7cdb88-8d9c-4a04-9b9e-cd6bc08f2aa9', 'Sustanon 250 - Community Discussion', 'Community discussion thread for Sustanon 250. Drop your experience below.', NOW(), NOW())
ON CONFLICT DO NOTHING;
UPDATE compounds SET thread_id = '8c6cbbed-0a56-5e5c-9dcf-afbdc9dba5d2' WHERE slug = 'sustanon-250';

INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('b9eff5ea-f4a4-5dc1-9ab2-b86a788aaa98', '8c6cbbed-0a56-5e5c-9dcf-afbdc9dba5d2', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '**Chris** — Trying out Sus250 with trenabol, was wondering if they should both be taken with food or prework or evening?', '2025-06-04T00:01:44Z', '2025-06-04T00:01:44Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('93613e15-7326-51a6-96d3-913500a391d7', '8c6cbbed-0a56-5e5c-9dcf-afbdc9dba5d2', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '**Chris** — Was also wondering why Hi-tech doesn''''t recommended taking both trenabol and sus250 together?', '2025-06-04T00:04:10Z', '2025-06-04T00:04:10Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('5ca2574a-304c-572c-92a6-8d37767b5ac9', '8c6cbbed-0a56-5e5c-9dcf-afbdc9dba5d2', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '**Anthony** — Hey Travis if your an athlete what would you say a decent cycle would be to gain size and boosting recovery for your first time?', '2025-08-24T03:50:02Z', '2025-08-24T03:50:02Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('d626f8ef-f894-563b-ba3b-81198d82fdaf', '8c6cbbed-0a56-5e5c-9dcf-afbdc9dba5d2', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '**Jonroig** — Running sust 250 as a standalone. Currently two weeks in. Having some good pumps in the gym, strength is going up.', '2025-11-20T22:12:46Z', '2025-11-20T22:12:46Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('4b4cc75b-b3ac-53a0-b758-53cbc9f50504', '8c6cbbed-0a56-5e5c-9dcf-afbdc9dba5d2', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '**Driggy** — What is the half lives of the 4 esters?', '2025-11-25T18:52:15Z', '2025-11-25T18:52:15Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('8477b79d-cc97-517f-bfc0-0e5885515c24', '8c6cbbed-0a56-5e5c-9dcf-afbdc9dba5d2', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '**Jon** — I''''m just now getting into pro hormones and sarms. Would this be a good test base for rad 140?', '2025-12-12T01:09:33Z', '2025-12-12T01:09:33Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, parent_id, body, created_at, updated_at)
VALUES ('b63cbdcf-5d49-56ca-85d5-8346adb92aa2', '8c6cbbed-0a56-5e5c-9dcf-afbdc9dba5d2', 'fa7cdb88-8d9c-4a04-9b9e-cd6bc08f2aa9', '93613e15-7326-51a6-96d3-913500a391d7', 'They definitely do. The 19-nor with the dry 6 oxo, is great paired with a 4-andro like sustanon 250', '2025-06-13T20:22:24Z', '2025-06-13T20:22:24Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, parent_id, body, created_at, updated_at)
VALUES ('18f3307e-3226-5e74-8bf2-ede7072dd888', '8c6cbbed-0a56-5e5c-9dcf-afbdc9dba5d2', 'fa7cdb88-8d9c-4a04-9b9e-cd6bc08f2aa9', '5ca2574a-304c-572c-92a6-8d37767b5ac9', '4-6 pounds brother. 1-2 pounds of water is a very realistic expectation. If you do decide to, enjoy the run brother!', '2025-09-10T16:15:18Z', '2025-09-10T16:15:18Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, parent_id, body, created_at, updated_at)
VALUES ('5168ccb9-03c6-5812-9179-9e89ddae1f96', '8c6cbbed-0a56-5e5c-9dcf-afbdc9dba5d2', 'd194f444-e2e0-59ee-b4df-b699e2d25307', 'd626f8ef-f894-563b-ba3b-81198d82fdaf', '**Talib - Same Day Supps** — How was the 4 weeks on sustanon 250? Did you switch to Chosen 1?', '2025-12-09T21:58:40Z', '2025-12-09T21:58:40Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, parent_id, body, created_at, updated_at)
VALUES ('3312a610-0a5f-5dfd-84f3-84feabf88844', '8c6cbbed-0a56-5e5c-9dcf-afbdc9dba5d2', 'fa7cdb88-8d9c-4a04-9b9e-cd6bc08f2aa9', '8477b79d-cc97-517f-bfc0-0e5885515c24', 'Yessir. This or andriol', '2025-12-15T02:28:08Z', '2025-12-15T02:28:08Z')
ON CONFLICT DO NOTHING;

-- === Trenabol (9 comments) ===
INSERT INTO threads (id, room_id, author_id, title, body, created_at, updated_at)
VALUES ('f4303ac7-eb74-5d97-9262-fb388e76147e', '78547f3a-7322-46ff-8e42-db75b849bec1', 'fa7cdb88-8d9c-4a04-9b9e-cd6bc08f2aa9', 'Trenabol - Community Discussion', 'Community discussion thread for Trenabol. Drop your experience below.', NOW(), NOW())
ON CONFLICT DO NOTHING;
UPDATE compounds SET thread_id = 'f4303ac7-eb74-5d97-9262-fb388e76147e' WHERE slug = 'trenabol';

INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('cc2c737a-e7d0-5853-bbbd-1cb3cb9e3696', 'f4303ac7-eb74-5d97-9262-fb388e76147e', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '**Chris** — Been on trenabol for 2 weeks now, experiencing some gastro sides. Very gassy and cramping.', '2025-06-18T12:21:16Z', '2025-06-18T12:21:16Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('832422e4-79f6-5376-971b-c09601727135', 'f4303ac7-eb74-5d97-9262-fb388e76147e', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '**Jay** — 1 day on Trenabol and I already noticed that I was unreasonably mad for a couple of hours.', '2025-06-21T09:49:07Z', '2025-06-21T09:49:07Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('1c2abe58-569a-58d0-8fad-d6ef0eed4d9d', 'f4303ac7-eb74-5d97-9262-fb388e76147e', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '**Mark** — This one didn''''t do much for me. Noticeable differences while on, increase in anger and decrease in libido.', '2025-09-07T03:10:48Z', '2025-09-07T03:10:48Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('35c502d7-90c8-5afd-b063-53885b438af0', 'f4303ac7-eb74-5d97-9262-fb388e76147e', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '**Leniel** — Currently on trenabol 2 weeks in and no side effects don''''t really feel stronger but I''''m noticing more definition and new veins coming out.', '2025-09-20T18:00:56Z', '2025-09-20T18:00:56Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('fe0d7af0-ed48-5c38-b4b1-5c37cbcf6b4a', 'f4303ac7-eb74-5d97-9262-fb388e76147e', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '**James** — Will be running this soon with epi andro. Want to thank you for such a great resource. Wish it had area for chat and maybe logs similar to anabolic minds.', '2025-10-08T19:38:46Z', '2025-10-08T19:38:46Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('1540134c-e52c-5ee8-b093-5ac3eb9547c0', 'f4303ac7-eb74-5d97-9262-fb388e76147e', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '**Ruben** — I''''m new to this and im currently taking andriol for about a month now. But im curious about this one. Any advice for beginner?', '2025-12-18T01:28:28Z', '2025-12-18T01:28:28Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, parent_id, body, created_at, updated_at)
VALUES ('e275f336-eec5-5d8c-a81e-96eb9b65bad4', 'f4303ac7-eb74-5d97-9262-fb388e76147e', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '832422e4-79f6-5376-971b-c09601727135', '**Jay update** — After an 8-week cycle, the aggression was a one-time thing, I was actually a bit more outgoing. Physical side effects: lots of acne. Second best prohormone I''''ve done only behind 1-test.', '2025-08-11T05:50:50Z', '2025-08-11T05:50:50Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, parent_id, body, created_at, updated_at)
VALUES ('1c1d1324-70b8-5622-aa58-9822cf881c9b', 'f4303ac7-eb74-5d97-9262-fb388e76147e', 'fa7cdb88-8d9c-4a04-9b9e-cd6bc08f2aa9', '35c502d7-90c8-5afd-b063-53885b438af0', 'Takes about 3 weeks to fully saturate. Week 4 which is about now for you, you should feel some strength kick in.', '2025-10-04T02:57:59Z', '2025-10-04T02:57:59Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, parent_id, body, created_at, updated_at)
VALUES ('1f1a5bb2-cae7-58c8-9b2d-c13b8f398672', 'f4303ac7-eb74-5d97-9262-fb388e76147e', 'fa7cdb88-8d9c-4a04-9b9e-cd6bc08f2aa9', '1c2abe58-569a-58d0-8fad-d6ef0eed4d9d', 'Thanks for share brother. Curious, did you run it standalone or with a 4-andro?', '2025-10-04T02:59:50Z', '2025-10-04T02:59:50Z')
ON CONFLICT DO NOTHING;

-- === TRT (3 comments) ===
INSERT INTO threads (id, room_id, author_id, title, body, created_at, updated_at)
VALUES ('1d588c30-f97d-5f69-a180-104630bceca6', '78547f3a-7322-46ff-8e42-db75b849bec1', 'fa7cdb88-8d9c-4a04-9b9e-cd6bc08f2aa9', 'TRT - Community Discussion', 'Community discussion thread for TRT. Drop your experience below.', NOW(), NOW())
ON CONFLICT DO NOTHING;
UPDATE compounds SET thread_id = '1d588c30-f97d-5f69-a180-104630bceca6' WHERE slug = 'trt';

INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('e1606402-df17-5840-8e2b-678c5809951b', '1d588c30-f97d-5f69-a180-104630bceca6', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '**anotsosingledad** — Been on trt for almost three years and holy shit did this reopen doors I thought getting older had firmly closed. I''''ve made great progress in the gym, I''''m a better father and husband. At 42yo I feel better than I did in my mid 20s.', '2025-08-11T17:53:13Z', '2025-08-11T17:53:13Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('231c7c18-210b-5a81-ab8a-3ecd074ebb3a', '1d588c30-f97d-5f69-a180-104630bceca6', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '**Question** — Where is the cheapest place to legally get trt?', '2025-10-28T20:04:44Z', '2025-10-28T20:04:44Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('1177ec96-79b6-5f06-aceb-a59614bdda46', '1d588c30-f97d-5f69-a180-104630bceca6', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '**Bqrbc0** — Currently on 100mg Test Cyp per week. After 3 months I started to notice changes. Total T went from 290 up to 711. Free T from 0.9 up to 5.3.', '2025-11-26T18:27:33Z', '2025-11-26T18:27:33Z')
ON CONFLICT DO NOTHING;

-- === Turk Builder (2 comments) ===
INSERT INTO threads (id, room_id, author_id, title, body, created_at, updated_at)
VALUES ('8a02cf3b-6681-5c10-aeed-6fee2908981e', '78547f3a-7322-46ff-8e42-db75b849bec1', 'fa7cdb88-8d9c-4a04-9b9e-cd6bc08f2aa9', 'Turk Builder - Community Discussion', 'Community discussion thread for Turk Builder. Drop your experience below.', NOW(), NOW())
ON CONFLICT DO NOTHING;
UPDATE compounds SET thread_id = '8a02cf3b-6681-5c10-aeed-6fee2908981e' WHERE slug = 'turk-builder';

INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('d1703d2b-51d1-52e2-9896-1baeb48dc230', '8a02cf3b-6681-5c10-aeed-6fee2908981e', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '**Jeremy** — Built up to 3 pills a day over a month then ran 3 pills for alittle over a month. Slight muscle improvement could of been placebo.', '2025-06-15T00:45:40Z', '2025-06-15T00:45:40Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, parent_id, body, created_at, updated_at)
VALUES ('4250235f-0733-50ba-bcc6-5df5b24981fe', '8a02cf3b-6681-5c10-aeed-6fee2908981e', 'fa7cdb88-8d9c-4a04-9b9e-cd6bc08f2aa9', 'd1703d2b-51d1-52e2-9896-1baeb48dc230', 'I can relate to this one man. The biggest thing is the pump, but overall, I''''d pass as well. Thermogenic effect was crazy, body temp was way up during workouts.', '2025-07-25T03:04:31Z', '2025-07-25T03:04:31Z')
ON CONFLICT DO NOTHING;

-- === Winstrol (2 comments) ===
INSERT INTO threads (id, room_id, author_id, title, body, created_at, updated_at)
VALUES ('dbae59e7-8855-5ed4-9855-8e5b6d22d545', '78547f3a-7322-46ff-8e42-db75b849bec1', 'fa7cdb88-8d9c-4a04-9b9e-cd6bc08f2aa9', 'Winstrol - Community Discussion', 'Community discussion thread for Winstrol. Drop your experience below.', NOW(), NOW())
ON CONFLICT DO NOTHING;
UPDATE compounds SET thread_id = 'dbae59e7-8855-5ed4-9855-8e5b6d22d545' WHERE slug = 'winstrol';

INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('5cfb6aeb-9da1-5244-80d9-842da77e684a', 'dbae59e7-8855-5ed4-9855-8e5b6d22d545', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '**colby resendez** — would this be ok with andriol as a test base or would i need something more powerful?', '2025-08-03T13:43:16Z', '2025-08-03T13:43:16Z')
ON CONFLICT DO NOTHING;
INSERT INTO posts (id, thread_id, author_id, body, created_at, updated_at)
VALUES ('824a2adc-5f18-5555-a4b8-481b47fc8a05', 'dbae59e7-8855-5ed4-9855-8e5b6d22d545', 'd194f444-e2e0-59ee-b4df-b699e2d25307', '**Tavis Drillard** — Ran for 8 weeks stacked with halodrol. Great results - strength and size gains, muscle hardness, vascularity, etc, but take the androgenic side effects seriously. My hair thinned.', '2025-08-04T20:54:45Z', '2025-08-04T20:54:45Z')
ON CONFLICT DO NOTHING;

COMMIT;

-- Verify: count posts per compound thread
SELECT c.name, COUNT(p.id) as post_count FROM compounds c
JOIN threads t ON t.id = c.thread_id
LEFT JOIN posts p ON p.thread_id = t.id
GROUP BY c.name ORDER BY post_count DESC;