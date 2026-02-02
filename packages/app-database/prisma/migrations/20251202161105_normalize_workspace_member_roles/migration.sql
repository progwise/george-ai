-- Normalize WorkspaceMember roles to lowercase

UPDATE "WorkspaceMember"
SET role = 'admin'
WHERE role = 'ADMIN';

UPDATE "WorkspaceMember"
SET role = 'owner'
WHERE role = 'OWNER';

UPDATE "WorkspaceMember"
SET role = 'member'
WHERE role = 'MEMBER';
