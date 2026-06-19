export const components = {
  securitySchemes: {
    bearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Token JWT obtenido en login o registro con Google',
    },
  },
  schemas: {
    ApiSuccess: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {},
      },
      required: ['success'],
    },
    ApiError: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'Descripción del error' },
      },
      required: ['success', 'message'],
    },
    GoogleAuthRequest: {
      type: 'object',
      required: ['idToken'],
      properties: {
        idToken: {
          type: 'string',
          description: 'ID token de Google OAuth 2.0',
        },
      },
    },
    UserProfile: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['composer', 'director', 'artist'] },
        id: { type: 'integer' },
        label: { type: 'string' },
      },
    },
    AuthUser: {
      type: 'object',
      properties: {
        id: { type: 'integer' },
        name: { type: 'string' },
        email: { type: 'string', format: 'email' },
        isAdmin: { type: 'boolean' },
        profiles: { type: 'array', items: { $ref: '#/components/schemas/UserProfile' } },
        isOyente: { type: 'boolean' },
        isViewer: { type: 'boolean' },
        profileLabel: { type: 'string' },
        picture: { type: 'string', nullable: true },
        isNew: { type: 'boolean', description: 'Solo en registro' },
      },
    },
    AuthResponse: {
      type: 'object',
      properties: {
        token: { type: 'string' },
        user: { $ref: '#/components/schemas/AuthUser' },
      },
    },
    ActiveProfile: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['composer', 'director', 'artist'] },
        label: { type: 'string' },
        description: { type: 'string' },
        id: { type: 'integer' },
        nickname: { type: 'string' },
        profileDescription: { type: 'string' },
        canDeactivate: { type: 'boolean' },
        deactivateBlockedReason: { type: 'string', nullable: true },
        usageCount: { type: 'integer' },
      },
    },
    AvailableProfile: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['composer', 'director', 'artist'] },
        label: { type: 'string' },
        description: { type: 'string' },
      },
    },
    ProfileStatus: {
      type: 'object',
      properties: {
        user: { $ref: '#/components/schemas/AuthUser' },
        baseRole: { type: 'string', example: 'oyente' },
        activeProfiles: { type: 'array', items: { $ref: '#/components/schemas/ActiveProfile' } },
        availableProfiles: { type: 'array', items: { $ref: '#/components/schemas/AvailableProfile' } },
        profiles: { type: 'array', items: { $ref: '#/components/schemas/UserProfile' } },
        isOyente: { type: 'boolean' },
        isViewer: { type: 'boolean' },
        profileLabel: { type: 'string' },
      },
    },
    ActivateProfileRequest: {
      type: 'object',
      properties: {
        nickname: { type: 'string', description: 'Nombre artístico (opcional, usa el nombre de cuenta por defecto)' },
      },
    },
    UpdateProfileRequest: {
      type: 'object',
      properties: {
        nickname: { type: 'string' },
        description: { type: 'string' },
      },
    },
    UpdateAccountRequest: {
      type: 'object',
      required: ['name'],
      properties: {
        name: { type: 'string' },
      },
    },
    UpdateAccountEmailRequest: {
      type: 'object',
      required: ['idToken'],
      properties: {
        idToken: { type: 'string', description: 'ID token de Google del nuevo correo' },
      },
    },
    Composer: {
      type: 'object',
      properties: {
        id_composer: { type: 'integer' },
        nickname: { type: 'string' },
        description: { type: 'string' },
        id_user: { type: 'integer', nullable: true },
      },
    },
    Director: {
      type: 'object',
      properties: {
        id_director: { type: 'integer' },
        nickname: { type: 'string' },
        description: { type: 'string' },
        id_user: { type: 'integer', nullable: true },
      },
    },
    Artist: {
      type: 'object',
      properties: {
        id_artist: { type: 'integer' },
        nickname: { type: 'string' },
        description: { type: 'string' },
        id_user: { type: 'integer', nullable: true },
      },
    },
    Genre: {
      type: 'object',
      properties: {
        id_genre: { type: 'integer' },
        name: { type: 'string' },
        description: { type: 'string' },
      },
    },
    TypeInterpretation: {
      type: 'object',
      properties: {
        id_type_interpretation: { type: 'integer' },
        name: { type: 'string' },
        min_artist: { type: 'integer' },
        max_artist: { type: 'integer' },
      },
    },
    TypeInstrument: {
      type: 'object',
      properties: {
        id_type_instrument: { type: 'integer' },
        name: { type: 'string' },
        description: { type: 'string' },
      },
    },
    Instrument: {
      type: 'object',
      properties: {
        id_instrument: { type: 'integer' },
        name: { type: 'string' },
        description: { type: 'string' },
        id_type_instrument: { type: 'integer' },
        type_instrument: { $ref: '#/components/schemas/TypeInstrument' },
      },
    },
    Work: {
      type: 'object',
      properties: {
        id_work: { type: 'integer' },
        name: { type: 'string' },
        description: { type: 'string' },
        write_date: { type: 'string', format: 'date' },
        score_pdf_url: { type: 'string', nullable: true },
        interpretation_count: { type: 'integer' },
        composers: { type: 'array', items: { $ref: '#/components/schemas/Composer' } },
        genres: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id_genre: { type: 'integer' },
              name: { type: 'string' },
            },
          },
        },
      },
    },
    InterpretationArtist: {
      type: 'object',
      properties: {
        id_artist: { type: 'integer' },
        id_instrument: { type: 'integer', nullable: true },
        artist: {
          type: 'object',
          properties: {
            id_artist: { type: 'integer' },
            nickname: { type: 'string' },
          },
        },
        instrument: {
          type: 'object',
          nullable: true,
          properties: {
            id_instrument: { type: 'integer' },
            name: { type: 'string' },
          },
        },
      },
    },
    Interpretation: {
      type: 'object',
      properties: {
        id_interpretation: { type: 'integer' },
        id_work: { type: 'integer' },
        id_director: { type: 'integer', nullable: true },
        id_type_interpretation: { type: 'integer', nullable: true },
        load_file_date: { type: 'string', format: 'date' },
        audio_mp3_url: { type: 'string', nullable: true },
        work: {
          type: 'object',
          properties: {
            id_work: { type: 'integer' },
            name: { type: 'string' },
          },
        },
        director: {
          type: 'object',
          nullable: true,
          properties: {
            id_director: { type: 'integer' },
            nickname: { type: 'string' },
          },
        },
        type_interpretation: { $ref: '#/components/schemas/TypeInterpretation' },
        interpretation_artists: {
          type: 'array',
          items: { $ref: '#/components/schemas/InterpretationArtist' },
        },
      },
    },
    InterpretationArtistInput: {
      type: 'object',
      required: ['id_artist'],
      properties: {
        id_artist: { type: 'integer' },
        id_instrument: { type: 'integer', nullable: true },
      },
    },
    Catalogs: {
      type: 'object',
      properties: {
        genres: { type: 'array', items: { $ref: '#/components/schemas/Genre' } },
        types: { type: 'array', items: { $ref: '#/components/schemas/TypeInterpretation' } },
        instruments: { type: 'array', items: { $ref: '#/components/schemas/Instrument' } },
        typeInstruments: { type: 'array', items: { $ref: '#/components/schemas/TypeInstrument' } },
      },
    },
    DashboardData: {
      type: 'object',
      properties: {
        scope: { type: 'string', enum: ['admin', 'personal'] },
        works: { type: 'array', items: { $ref: '#/components/schemas/Work' } },
        interpretations: { type: 'array', items: { $ref: '#/components/schemas/Interpretation' } },
        showWorks: { type: 'boolean' },
        showInterpretations: { type: 'boolean' },
      },
    },
    AdminUser: {
      type: 'object',
      properties: {
        id: { type: 'integer' },
        name: { type: 'string' },
        email: { type: 'string' },
        isAdmin: { type: 'boolean' },
        profileLabel: { type: 'string' },
      },
    },
    UpdateAdminStatusRequest: {
      type: 'object',
      required: ['isAdmin'],
      properties: {
        isAdmin: { type: 'boolean' },
      },
    },
    TypeInstrumentInput: {
      type: 'object',
      required: ['name'],
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
      },
    },
    InstrumentInput: {
      type: 'object',
      required: ['name', 'id_type_instrument'],
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        id_type_instrument: { type: 'integer' },
      },
    },
    CreateArtistRequest: {
      type: 'object',
      required: ['nickname'],
      properties: {
        nickname: { type: 'string' },
        description: { type: 'string' },
      },
    },
    DeletedResponse: {
      type: 'object',
      properties: {
        deleted: { type: 'boolean', example: true },
      },
    },
  },
  responses: {
    Unauthorized: {
      description: 'No autenticado o token inválido',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/ApiError' },
        },
      },
    },
    Forbidden: {
      description: 'Sin permisos para esta operación',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/ApiError' },
        },
      },
    },
    NotFound: {
      description: 'Recurso no encontrado',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/ApiError' },
        },
      },
    },
    BadRequest: {
      description: 'Datos inválidos',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/ApiError' },
        },
      },
    },
    Conflict: {
      description: 'Conflicto de negocio',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/ApiError' },
        },
      },
    },
    InternalError: {
      description: 'Error interno del servidor',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/ApiError' },
        },
      },
    },
  },
};
