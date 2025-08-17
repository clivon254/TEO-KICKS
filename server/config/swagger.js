import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'


const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TEO KICKS API',
      version: '1.0.0',
      description: 'A comprehensive e-commerce API for TEO KICKS shoe store in Kenya',
      contact: {
        name: 'TEO KICKS Support',
        email: 'support@teokicks.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://api.teokicks.com' 
          : `http://localhost:${process.env.PORT || 3000}`,
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your Bearer token in the format: Bearer <token>'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'User ID'
            },
            name: {
              type: 'string',
              description: 'User full name'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            phone: {
              type: 'string',
              description: 'User phone number'
            },
            avatar: {
              type: 'string',
              description: 'User avatar URL'
            },
            isAdmin: {
              type: 'boolean',
              description: 'Whether user has admin privileges'
            },
            roles: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Role'
              },
              description: 'User assigned roles'
            },
            isVerified: {
              type: 'boolean',
              description: 'Whether user is verified'
            },
            isActive: {
              type: 'boolean',
              description: 'Whether user account is active'
            },
            country: {
              type: 'string',
              description: 'User country'
            },
            timezone: {
              type: 'string',
              description: 'User timezone'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            }
          }
        },
        Role: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Role ID'
            },
            name: {
              type: 'string',
              description: 'Role name (unique, lowercase)'
            },
            description: {
              type: 'string',
              description: 'Role description'
            },
            isActive: {
              type: 'boolean',
              description: 'Whether role is active'
            },
            createdBy: {
              type: 'string',
              description: 'ID of user who created this role'
            },
            updatedBy: {
              type: 'string',
              description: 'ID of user who last updated this role'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Role creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            }
          }
        },
        Address: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Address ID'
            },
            userId: {
              type: 'string',
              description: 'User ID who owns this address'
            },
            label: {
              type: 'string',
              description: 'Address label (Home, Office, etc.)'
            },
            street: {
              type: 'string',
              description: 'Street address'
            },
            city: {
              type: 'string',
              description: 'City name'
            },
            region: {
              type: 'string',
              description: 'Region/County'
            },
            country: {
              type: 'string',
              description: 'Country name'
            },
            postal: {
              type: 'string',
              description: 'Postal code'
            },
            googlePlaceId: {
              type: 'string',
              description: 'Google Places API place ID'
            },
            coordinates: {
              type: 'object',
              properties: {
                latitude: {
                  type: 'number',
                  description: 'Latitude coordinate'
                },
                longitude: {
                  type: 'number',
                  description: 'Longitude coordinate'
                }
              }
            },
            formattedAddress: {
              type: 'string',
              description: 'Formatted address from Google Places'
            },
            locationDetails: {
              type: 'object',
              properties: {
                neighborhood: {
                  type: 'string',
                  description: 'Neighborhood name'
                },
                sublocality: {
                  type: 'string',
                  description: 'Sublocality name'
                },
                administrativeArea: {
                  type: 'string',
                  description: 'Administrative area'
                },
                route: {
                  type: 'string',
                  description: 'Route/street name'
                },
                streetNumber: {
                  type: 'string',
                  description: 'Street number'
                }
              }
            },
            isDefault: {
              type: 'boolean',
              description: 'Whether this is the default address'
            },
            isActive: {
              type: 'boolean',
              description: 'Whether this address is active'
            },
            fullAddress: {
              type: 'string',
              description: 'Full formatted address (virtual field)'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Address creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean'
            },
            message: {
              type: 'string'
            },
            data: {
              type: 'object',
              properties: {
                user: {
                  $ref: '#/components/schemas/User'
                },
                accessToken: {
                  type: 'string',
                  description: 'JWT access token'
                },
                refreshToken: {
                  type: 'string',
                  description: 'JWT refresh token'
                }
              }
            }
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              description: 'Success message'
            },
            data: {
              type: 'object',
              description: 'Response data'
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              description: 'Error message'
            },
            statusCode: {
              type: 'number',
              description: 'HTTP status code'
            }
          }
        },
        PaginationResponse: {
          type: 'object',
          properties: {
            currentPage: {
              type: 'number',
              description: 'Current page number'
            },
            totalPages: {
              type: 'number',
              description: 'Total number of pages'
            },
            totalItems: {
              type: 'number',
              description: 'Total number of items'
            },
            hasNextPage: {
              type: 'boolean',
              description: 'Whether there is a next page'
            },
            hasPrevPage: {
              type: 'boolean',
              description: 'Whether there is a previous page'
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization'
      },
      {
        name: 'Users',
        description: 'User profile and account management'
      },
      {
        name: 'Addresses',
        description: 'Address management with Google Places integration'
      },
      {
        name: 'Roles',
        description: 'Role-based access control and permission management'
      },
      {
        name: 'Products',
        description: 'Product catalog and inventory management'
      },
      {
        name: 'Orders',
        description: 'Order processing and tracking'
      },
      {
        name: 'Payments',
        description: 'Payment processing (M-Pesa, Paystack)'
      }
    ]
  },
  apis: [
    './routes/*.js',
    './controllers/*.js',
    './models/*.js'
  ]
}


const specs = swaggerJsdoc(options)


const swaggerConfig = {
  swaggerUi,
  specs,
  options: {
    explorer: true,
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #4B2E83 }
      .swagger-ui .scheme-container { background: #f8f9fa }
    `,
    customSiteTitle: 'TEO KICKS API Documentation',
    customfavIcon: '/favicon.ico'
  }
}


export default swaggerConfig