const jsonSuccess = (schema) => ({
  description: 'Operación exitosa',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: schema,
        },
      },
    },
  },
});

const bearerSecurity = [{ bearerAuth: [] }];

const profilePath = (type, label) => ({
  post: {
    tags: ['Perfil'],
    summary: `Activar perfil de ${label}`,
    description: `Crea el perfil de ${label} para el usuario autenticado.`,
    security: bearerSecurity,
    requestBody: {
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/ActivateProfileRequest' },
        },
      },
    },
    responses: {
      201: jsonSuccess({ $ref: '#/components/schemas/ProfileStatus' }),
      400: { $ref: '#/components/responses/BadRequest' },
      401: { $ref: '#/components/responses/Unauthorized' },
      409: { $ref: '#/components/responses/Conflict' },
    },
  },
  patch: {
    tags: ['Perfil'],
    summary: `Actualizar perfil de ${label}`,
    security: bearerSecurity,
    requestBody: {
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/UpdateProfileRequest' },
        },
      },
    },
    responses: {
      200: jsonSuccess({ $ref: '#/components/schemas/ProfileStatus' }),
      400: { $ref: '#/components/responses/BadRequest' },
      401: { $ref: '#/components/responses/Unauthorized' },
      404: { $ref: '#/components/responses/NotFound' },
    },
  },
  delete: {
    tags: ['Perfil'],
    summary: `Desactivar perfil de ${label}`,
    description: 'No se puede desactivar si el perfil tiene obras o interpretaciones asociadas.',
    security: bearerSecurity,
    responses: {
      200: jsonSuccess({ $ref: '#/components/schemas/ProfileStatus' }),
      401: { $ref: '#/components/responses/Unauthorized' },
      404: { $ref: '#/components/responses/NotFound' },
      409: { $ref: '#/components/responses/Conflict' },
    },
  },
});

export const paths = {
  '/api/health': {
    get: {
      tags: ['Sistema'],
      summary: 'Estado de la API',
      description: 'Comprueba que el servidor está en ejecución. No requiere autenticación.',
      responses: {
        200: {
          description: 'API disponible',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'OrchestApp API' },
                },
              },
            },
          },
        },
      },
    },
  },

  '/api/auth/google': {
    post: {
      tags: ['Autenticación'],
      summary: 'Iniciar sesión con Google',
      description: 'Verifica el `idToken` de Google y devuelve un JWT de la aplicación.',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/GoogleAuthRequest' },
          },
        },
      },
      responses: {
        200: jsonSuccess({ $ref: '#/components/schemas/AuthResponse' }),
        400: { $ref: '#/components/responses/BadRequest' },
        401: { $ref: '#/components/responses/Unauthorized' },
        404: { $ref: '#/components/responses/NotFound' },
        500: { $ref: '#/components/responses/InternalError' },
      },
    },
  },

  '/api/auth/google/register': {
    post: {
      tags: ['Autenticación'],
      summary: 'Registrarse con Google',
      description: 'Crea una cuenta nueva a partir del `idToken` de Google.',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/GoogleAuthRequest' },
          },
        },
      },
      responses: {
        201: jsonSuccess({ $ref: '#/components/schemas/AuthResponse' }),
        400: { $ref: '#/components/responses/BadRequest' },
        401: { $ref: '#/components/responses/Unauthorized' },
        409: { $ref: '#/components/responses/Conflict' },
        500: { $ref: '#/components/responses/InternalError' },
      },
    },
  },

  '/api/auth/me': {
    get: {
      tags: ['Autenticación'],
      summary: 'Usuario autenticado',
      security: bearerSecurity,
      responses: {
        200: jsonSuccess({ $ref: '#/components/schemas/AuthUser' }),
        401: { $ref: '#/components/responses/Unauthorized' },
      },
    },
  },

  '/api/profile': {
    get: {
      tags: ['Perfil'],
      summary: 'Estado de perfiles',
      description: 'Devuelve perfiles activos, disponibles y datos de la cuenta.',
      security: bearerSecurity,
      responses: {
        200: jsonSuccess({ $ref: '#/components/schemas/ProfileStatus' }),
        401: { $ref: '#/components/responses/Unauthorized' },
      },
    },
  },

  '/api/profile/account': {
    patch: {
      tags: ['Perfil'],
      summary: 'Actualizar nombre de cuenta',
      security: bearerSecurity,
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UpdateAccountRequest' },
          },
        },
      },
      responses: {
        200: jsonSuccess({ $ref: '#/components/schemas/ProfileStatus' }),
        400: { $ref: '#/components/responses/BadRequest' },
        401: { $ref: '#/components/responses/Unauthorized' },
      },
    },
  },

  '/api/profile/account/email': {
    patch: {
      tags: ['Perfil'],
      summary: 'Cambiar correo con Google',
      description: 'Verifica un nuevo correo mediante `idToken` de Google.',
      security: bearerSecurity,
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UpdateAccountEmailRequest' },
          },
        },
      },
      responses: {
        200: jsonSuccess({ $ref: '#/components/schemas/ProfileStatus' }),
        400: { $ref: '#/components/responses/BadRequest' },
        401: { $ref: '#/components/responses/Unauthorized' },
        409: { $ref: '#/components/responses/Conflict' },
      },
    },
  },

  '/api/profile/composer': profilePath('composer', 'Compositor'),
  '/api/profile/director': profilePath('director', 'Director'),
  '/api/profile/artist': profilePath('artist', 'Artista'),

  '/api/dashboard': {
    get: {
      tags: ['Dashboard'],
      summary: 'Panel personalizado',
      description:
        'Requiere perfil de compositor, director, artista o rol admin. Devuelve obras e interpretaciones según el rol.',
      security: bearerSecurity,
      responses: {
        200: jsonSuccess({ $ref: '#/components/schemas/DashboardData' }),
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
      },
    },
  },

  '/api/admin/users': {
    get: {
      tags: ['Administración'],
      summary: 'Listar usuarios',
      security: bearerSecurity,
      responses: {
        200: jsonSuccess({ type: 'array', items: { $ref: '#/components/schemas/AdminUser' } }),
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
      },
    },
  },

  '/api/admin/users/{id}': {
    patch: {
      tags: ['Administración'],
      summary: 'Asignar o quitar rol administrador',
      security: bearerSecurity,
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'integer' },
          description: 'ID del usuario (`id_user`)',
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UpdateAdminStatusRequest' },
          },
        },
      },
      responses: {
        200: jsonSuccess({ $ref: '#/components/schemas/AdminUser' }),
        400: { $ref: '#/components/responses/BadRequest' },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        404: { $ref: '#/components/responses/NotFound' },
      },
    },
  },

  '/api/admin/instruments-catalog': {
    get: {
      tags: ['Administración'],
      summary: 'Catálogo de instrumentos (admin)',
      security: bearerSecurity,
      responses: {
        200: jsonSuccess({
          type: 'object',
          properties: {
            typeInstruments: { type: 'array', items: { $ref: '#/components/schemas/TypeInstrument' } },
            instruments: { type: 'array', items: { $ref: '#/components/schemas/Instrument' } },
          },
        }),
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
      },
    },
  },

  '/api/admin/type-instruments': {
    post: {
      tags: ['Administración'],
      summary: 'Crear tipo de instrumento',
      security: bearerSecurity,
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/TypeInstrumentInput' },
          },
        },
      },
      responses: {
        201: jsonSuccess({ $ref: '#/components/schemas/TypeInstrument' }),
        400: { $ref: '#/components/responses/BadRequest' },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
      },
    },
  },

  '/api/admin/type-instruments/{id}': {
    put: {
      tags: ['Administración'],
      summary: 'Actualizar tipo de instrumento',
      security: bearerSecurity,
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      requestBody: {
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/TypeInstrumentInput' },
          },
        },
      },
      responses: {
        200: jsonSuccess({ $ref: '#/components/schemas/TypeInstrument' }),
        400: { $ref: '#/components/responses/BadRequest' },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        404: { $ref: '#/components/responses/NotFound' },
      },
    },
    delete: {
      tags: ['Administración'],
      summary: 'Eliminar tipo de instrumento',
      description: 'No se puede eliminar si tiene instrumentos asociados.',
      security: bearerSecurity,
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: {
        200: jsonSuccess({ $ref: '#/components/schemas/DeletedResponse' }),
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        404: { $ref: '#/components/responses/NotFound' },
        409: { $ref: '#/components/responses/Conflict' },
      },
    },
  },

  '/api/admin/instruments': {
    post: {
      tags: ['Administración'],
      summary: 'Crear instrumento',
      security: bearerSecurity,
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/InstrumentInput' },
          },
        },
      },
      responses: {
        201: jsonSuccess({ $ref: '#/components/schemas/Instrument' }),
        400: { $ref: '#/components/responses/BadRequest' },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        404: { $ref: '#/components/responses/NotFound' },
      },
    },
  },

  '/api/admin/instruments/{id}': {
    put: {
      tags: ['Administración'],
      summary: 'Actualizar instrumento',
      security: bearerSecurity,
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      requestBody: {
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/InstrumentInput' },
          },
        },
      },
      responses: {
        200: jsonSuccess({ $ref: '#/components/schemas/Instrument' }),
        400: { $ref: '#/components/responses/BadRequest' },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        404: { $ref: '#/components/responses/NotFound' },
      },
    },
    delete: {
      tags: ['Administración'],
      summary: 'Eliminar instrumento',
      description: 'No se puede eliminar si está usado en interpretaciones.',
      security: bearerSecurity,
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: {
        200: jsonSuccess({ $ref: '#/components/schemas/DeletedResponse' }),
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        404: { $ref: '#/components/responses/NotFound' },
        409: { $ref: '#/components/responses/Conflict' },
      },
    },
  },

  '/api/catalogs': {
    get: {
      tags: ['Catálogo'],
      summary: 'Catálogos de apoyo',
      description: 'Géneros, tipos de interpretación, instrumentos y tipos de instrumento.',
      security: bearerSecurity,
      responses: {
        200: jsonSuccess({ $ref: '#/components/schemas/Catalogs' }),
        401: { $ref: '#/components/responses/Unauthorized' },
      },
    },
  },

  '/api/works': {
    get: {
      tags: ['Obras'],
      summary: 'Listar obras',
      security: bearerSecurity,
      responses: {
        200: jsonSuccess({ type: 'array', items: { $ref: '#/components/schemas/Work' } }),
        401: { $ref: '#/components/responses/Unauthorized' },
      },
    },
    post: {
      tags: ['Obras'],
      summary: 'Crear obra',
      description:
        'Requiere perfil de compositor o admin. Usa `multipart/form-data`. Con `mode=historic` solo admin puede registrar obras históricas.',
      security: bearerSecurity,
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              required: ['name', 'write_date'],
              properties: {
                name: { type: 'string' },
                description: { type: 'string' },
                write_date: { type: 'string', format: 'date', example: '2024-01-15' },
                mode: {
                  type: 'string',
                  enum: ['historic'],
                  description: 'Solo admin: obra histórica con compositores libres',
                },
                composerIds: {
                  type: 'string',
                  description: 'JSON array de IDs, ej. `[1,2]`',
                  example: '[1]',
                },
                genreIds: {
                  type: 'string',
                  description: 'JSON array de IDs, ej. `[3,5]`',
                  example: '[3]',
                },
                scorePdf: {
                  type: 'string',
                  format: 'binary',
                  description: 'Partitura en PDF (máx. 15 MB)',
                },
              },
            },
          },
        },
      },
      responses: {
        201: jsonSuccess({ $ref: '#/components/schemas/Work' }),
        400: { $ref: '#/components/responses/BadRequest' },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
      },
    },
  },

  '/api/works/{id}': {
    get: {
      tags: ['Obras'],
      summary: 'Detalle de obra',
      security: bearerSecurity,
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: {
        200: jsonSuccess({ $ref: '#/components/schemas/Work' }),
        401: { $ref: '#/components/responses/Unauthorized' },
        404: { $ref: '#/components/responses/NotFound' },
      },
    },
    put: {
      tags: ['Obras'],
      summary: 'Actualizar obra',
      description: 'Mismo formato `multipart/form-data` que la creación. El PDF es opcional en actualización.',
      security: bearerSecurity,
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      requestBody: {
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                description: { type: 'string' },
                write_date: { type: 'string', format: 'date' },
                mode: { type: 'string', enum: ['historic'] },
                composerIds: { type: 'string', example: '[1,2]' },
                genreIds: { type: 'string', example: '[3]' },
                scorePdf: { type: 'string', format: 'binary' },
              },
            },
          },
        },
      },
      responses: {
        200: jsonSuccess({ $ref: '#/components/schemas/Work' }),
        400: { $ref: '#/components/responses/BadRequest' },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        404: { $ref: '#/components/responses/NotFound' },
      },
    },
    delete: {
      tags: ['Obras'],
      summary: 'Eliminar obra',
      description: 'No se puede eliminar si tiene interpretaciones asociadas.',
      security: bearerSecurity,
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: {
        200: jsonSuccess({ $ref: '#/components/schemas/DeletedResponse' }),
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        404: { $ref: '#/components/responses/NotFound' },
        409: { $ref: '#/components/responses/Conflict' },
      },
    },
  },

  '/api/composers': {
    get: {
      tags: ['Compositores'],
      summary: 'Listar compositores',
      security: bearerSecurity,
      responses: {
        200: jsonSuccess({ type: 'array', items: { $ref: '#/components/schemas/Composer' } }),
        401: { $ref: '#/components/responses/Unauthorized' },
      },
    },
  },

  '/api/composers/{id}': {
    put: {
      tags: ['Compositores'],
      summary: 'Actualizar compositor',
      description: 'Requiere perfil de compositor, director, artista o admin.',
      security: bearerSecurity,
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      requestBody: {
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UpdateProfileRequest' },
          },
        },
      },
      responses: {
        200: jsonSuccess({ $ref: '#/components/schemas/Composer' }),
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        404: { $ref: '#/components/responses/NotFound' },
      },
    },
  },

  '/api/directors': {
    get: {
      tags: ['Directores'],
      summary: 'Listar directores',
      security: bearerSecurity,
      responses: {
        200: jsonSuccess({ type: 'array', items: { $ref: '#/components/schemas/Director' } }),
        401: { $ref: '#/components/responses/Unauthorized' },
      },
    },
  },

  '/api/directors/{id}': {
    get: {
      tags: ['Directores'],
      summary: 'Detalle de director',
      security: bearerSecurity,
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: {
        200: jsonSuccess({ $ref: '#/components/schemas/Director' }),
        401: { $ref: '#/components/responses/Unauthorized' },
        404: { $ref: '#/components/responses/NotFound' },
      },
    },
    put: {
      tags: ['Directores'],
      summary: 'Actualizar director',
      description: 'Requiere perfil de compositor, director, artista o admin.',
      security: bearerSecurity,
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      requestBody: {
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UpdateProfileRequest' },
          },
        },
      },
      responses: {
        200: jsonSuccess({ $ref: '#/components/schemas/Director' }),
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        404: { $ref: '#/components/responses/NotFound' },
      },
    },
  },

  '/api/artists': {
    get: {
      tags: ['Artistas'],
      summary: 'Listar artistas',
      security: bearerSecurity,
      responses: {
        200: jsonSuccess({ type: 'array', items: { $ref: '#/components/schemas/Artist' } }),
        401: { $ref: '#/components/responses/Unauthorized' },
      },
    },
    post: {
      tags: ['Artistas'],
      summary: 'Crear artista sin cuenta',
      description: 'Requiere perfil de director o admin. Crea un artista sin usuario vinculado.',
      security: bearerSecurity,
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateArtistRequest' },
          },
        },
      },
      responses: {
        201: jsonSuccess({ $ref: '#/components/schemas/Artist' }),
        400: { $ref: '#/components/responses/BadRequest' },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
      },
    },
  },

  '/api/artists/{id}': {
    get: {
      tags: ['Artistas'],
      summary: 'Detalle de artista',
      security: bearerSecurity,
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: {
        200: jsonSuccess({ $ref: '#/components/schemas/Artist' }),
        401: { $ref: '#/components/responses/Unauthorized' },
        404: { $ref: '#/components/responses/NotFound' },
      },
    },
    put: {
      tags: ['Artistas'],
      summary: 'Actualizar artista',
      description: 'Requiere perfil de compositor, director, artista o admin.',
      security: bearerSecurity,
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      requestBody: {
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateArtistRequest' },
          },
        },
      },
      responses: {
        200: jsonSuccess({ $ref: '#/components/schemas/Artist' }),
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        404: { $ref: '#/components/responses/NotFound' },
      },
    },
  },

  '/api/interpretations': {
    get: {
      tags: ['Interpretaciones'],
      summary: 'Listar interpretaciones',
      security: bearerSecurity,
      parameters: [
        { name: 'artistId', in: 'query', schema: { type: 'integer' }, description: 'Filtrar por artista' },
        { name: 'directorId', in: 'query', schema: { type: 'integer' }, description: 'Filtrar por director' },
        { name: 'workId', in: 'query', schema: { type: 'integer' }, description: 'Filtrar por obra' },
      ],
      responses: {
        200: jsonSuccess({ type: 'array', items: { $ref: '#/components/schemas/Interpretation' } }),
        401: { $ref: '#/components/responses/Unauthorized' },
      },
    },
    post: {
      tags: ['Interpretaciones'],
      summary: 'Crear interpretación',
      description:
        'Requiere perfil de director o admin. Usa `multipart/form-data`. Con `mode=legacy` solo admin registra interpretaciones históricas (MP3 opcional).',
      security: bearerSecurity,
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              required: ['id_work'],
              properties: {
                id_work: { type: 'integer' },
                id_type_interpretation: { type: 'integer', nullable: true },
                load_file_date: { type: 'string', format: 'date' },
                mode: {
                  type: 'string',
                  enum: ['legacy'],
                  description: 'Solo admin: interpretación histórica',
                },
                artists: {
                  type: 'string',
                  description: 'JSON array de `{ id_artist, id_instrument? }`',
                  example: '[{"id_artist":1,"id_instrument":2}]',
                },
                audioMp3: {
                  type: 'string',
                  format: 'binary',
                  description: 'Audio MP3 (máx. 50 MB). Obligatorio salvo modo legacy admin.',
                },
              },
            },
          },
        },
      },
      responses: {
        201: jsonSuccess({ $ref: '#/components/schemas/Interpretation' }),
        400: { $ref: '#/components/responses/BadRequest' },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        404: { $ref: '#/components/responses/NotFound' },
      },
    },
  },

  '/api/interpretations/{id}': {
    put: {
      tags: ['Interpretaciones'],
      summary: 'Actualizar interpretación',
      description: 'Mismo formato `multipart/form-data` que la creación.',
      security: bearerSecurity,
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      requestBody: {
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              properties: {
                id_work: { type: 'integer' },
                id_type_interpretation: { type: 'integer', nullable: true },
                load_file_date: { type: 'string', format: 'date' },
                mode: { type: 'string', enum: ['legacy'] },
                artists: { type: 'string', example: '[{"id_artist":1,"id_instrument":2}]' },
                audioMp3: { type: 'string', format: 'binary' },
              },
            },
          },
        },
      },
      responses: {
        200: jsonSuccess({ $ref: '#/components/schemas/Interpretation' }),
        400: { $ref: '#/components/responses/BadRequest' },
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        404: { $ref: '#/components/responses/NotFound' },
      },
    },
    delete: {
      tags: ['Interpretaciones'],
      summary: 'Eliminar interpretación',
      security: bearerSecurity,
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: {
        200: jsonSuccess({ $ref: '#/components/schemas/DeletedResponse' }),
        401: { $ref: '#/components/responses/Unauthorized' },
        403: { $ref: '#/components/responses/Forbidden' },
        404: { $ref: '#/components/responses/NotFound' },
      },
    },
  },
};
