
delete from public."AiAssistant" where "ownerId"='cm5z8i31i0000pkvej888vv09';
delete from public."User" where username='moncapitaine';


INSERT INTO public."User" (id,"createdAt","updatedAt", "lastLogin",email,username, name) VALUES
	 ('cm5z8i31i0000pkvej888vv09','2025-01-16T11:15:18.630Z','2025-01-16T11:15:18.630Z', '2025-01-16T15:07:15.416Z','michael.vogt@progwise.net','moncapitaine', 'Michael Vogt');


INSERT INTO public."AiAssistant" (id,"createdAt","updatedAt",name,description,url,icon,"ownerId", "aiAssistantType") VALUES
	 ('cm5wpwt3f0000pkeb5y8bbm5c','2025-01-14 16:59:20.524','2025-01-14 17:13:27.429','Reisebot','Test um die Kunden Hilfestellungen beim Reisen mit großen Wohnmobilen zu geben',NULL,'https://landyachting.de/wp-content/uploads/2024/08/Slider-San-Servolo.jpg','cm5z8i31i0000pkvej888vv09', 'CHATBOT'),
	 ('cm5v3kjrf0001mw4hmiyvdugn','2025-01-13 13:46:10.828','2025-01-14 17:15:16.762','Testbot1','Grundfunktionen Test',NULL,'https://www.medizin.uni-greifswald.de/fileadmin/_processed_/5/f/csm_startbild_umg4230_9abb2f7fcf.jpg','cm5z8i31i0000pkvej888vv09', 'CHATBOT');

