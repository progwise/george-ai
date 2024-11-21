/// <reference path="../pb_data/types.d.ts" />
migrate(
  (db) => {
    const snapshot = [
      {
        id: '_pb_users_auth_',
        created: '2024-11-19 15:50:10.764Z',
        updated: '2024-11-19 15:50:10.765Z',
        name: 'users',
        type: 'auth',
        system: false,
        schema: [
          {
            system: false,
            id: 'users_name',
            name: 'name',
            type: 'text',
            required: false,
            presentable: false,
            unique: false,
            options: {
              min: null,
              max: null,
              pattern: '',
            },
          },
          {
            system: false,
            id: 'users_avatar',
            name: 'avatar',
            type: 'file',
            required: false,
            presentable: false,
            unique: false,
            options: {
              mimeTypes: [
                'image/jpeg',
                'image/png',
                'image/svg+xml',
                'image/gif',
                'image/webp',
              ],
              thumbs: null,
              maxSelect: 1,
              maxSize: 5242880,
              protected: false,
            },
          },
        ],
        indexes: [],
        listRule: 'id = @request.auth.id',
        viewRule: 'id = @request.auth.id',
        createRule: '',
        updateRule: 'id = @request.auth.id',
        deleteRule: 'id = @request.auth.id',
        options: {
          allowEmailAuth: true,
          allowOAuth2Auth: true,
          allowUsernameAuth: true,
          exceptEmailDomains: null,
          manageRule: null,
          minPasswordLength: 8,
          onlyEmailDomains: null,
          onlyVerified: false,
          requireEmail: false,
        },
      },
      {
        id: 'uxm1kqsw64qq27c',
        created: '2024-11-19 15:52:00.051Z',
        updated: '2024-11-19 15:52:00.051Z',
        name: 'documents',
        type: 'base',
        system: false,
        schema: [
          {
            system: false,
            id: 'semu577p',
            name: 'field',
            type: 'file',
            required: true,
            presentable: true,
            unique: false,
            options: {
              mimeTypes: ['application/pdf'],
              thumbs: [],
              maxSelect: 1,
              maxSize: 5242880,
              protected: true,
            },
          },
          {
            system: false,
            id: 'q2tcx3iv',
            name: 'processed',
            type: 'bool',
            required: false,
            presentable: true,
            unique: false,
            options: {},
          },
        ],
        indexes: [],
        listRule: null,
        viewRule: null,
        createRule: null,
        updateRule: null,
        deleteRule: null,
        options: {},
      },
    ]

    const collections = snapshot.map((item) => new Collection(item))

    return Dao(db).importCollections(collections, true, null)
  },
  (db) => {
    return null
  },
)
