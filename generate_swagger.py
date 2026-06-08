import json
import os

spec = {
    "openapi": "3.0.3",
    "info": {
        "title": "Autours API",
        "description": "Complete API documentation for Autours car rental platform. Covers all JSON endpoints needed to build a separated frontend.\n\n**Auth modes:**\n- Session cookie auth for web routes (login via `/login` sets session cookie)\n- Bearer token (Sanctum) for API routes (login via `/api/external/supplier/login`)\n- Some routes use middleware guards: `admin`, `admin_or_supplier`, `active_supplier`, `customer`, `member`",
        "version": "2.0.0",
        "contact": {"name": "Autours Support", "email": "info@autours.net"}
    },
    "servers": [
        {"url": "https://www.autours.net", "description": "Production Server"},
        {"url": "http://localhost:8000", "description": "Local Development Server"}
    ],
    "tags": [
        {"name": "Authentication", "description": "Login, logout, register, password reset"},
        {"name": "External Supplier API", "description": "Sanctum-token-based API for external suppliers"},
        {"name": "User & Profile", "description": "User data, roles, companies, customers"},
        {"name": "Vehicles", "description": "Vehicle search, filter, CRUD, pricing"},
        {"name": "Bookings & Rentals", "description": "Booking creation, cancellation, rental lists, invoices"},
        {"name": "Branches", "description": "Branch management"},
        {"name": "Categories", "description": "Vehicle categories"},
        {"name": "Specifications", "description": "Vehicle specifications"},
        {"name": "Included", "description": "What's included items"},
        {"name": "Fuel Policies", "description": "Fuel policies"},
        {"name": "Location Types", "description": "Location types"},
        {"name": "Rental Terms", "description": "Rental terms management"},
        {"name": "Payment Methods", "description": "Supplier payment methods"},
        {"name": "Promos", "description": "Promotions / offers"},
        {"name": "Rates & Reviews", "description": "Ratings and review questions"},
        {"name": "Background Settings", "description": "Background image settings"},
        {"name": "Blog", "description": "Blog posts"},
        {"name": "Blog Categories", "description": "Blog categories"},
        {"name": "Subscribers", "description": "Newsletter subscribers"},
        {"name": "Dashboard", "description": "Dashboard stats"},
        {"name": "Reference Data", "description": "Countries, currencies, logos, backgrounds, photos"},
        {"name": "Admin", "description": "Admin-only operations"},
        {"name": "Supplier", "description": "Supplier-only operations"},
        {"name": "Customer", "description": "Customer-only operations"}
    ],
    "paths": {},
    "components": {
        "securitySchemes": {
            "bearerAuth": {
                "type": "http",
                "scheme": "bearer",
                "bearerFormat": "Token",
                "description": "Sanctum token from supplier/external login"
            }
        },
        "schemas": {}
    }
}

def add_path(path, methods):
    spec["paths"][path] = methods

def resp_json(desc, schema_ref=None, example=None):
    r = {"description": desc, "content": {"application/json": {"schema": {}}}}
    if schema_ref:
        r["content"]["application/json"]["schema"]["$ref"] = schema_ref
    else:
        r["content"]["application/json"]["schema"] = {"type": "object"}
    if example:
        r["content"]["application/json"]["example"] = example
    return r

def unauthorized():
    return resp_json("Unauthenticated or unauthorized", "#/components/schemas/ErrorResponse")

# ============================================================
# AUTHENTICATION
# ============================================================
add_path("/login", {
    "post": {
        "tags": ["Authentication"],
        "summary": "Web Login",
        "description": "Authenticate with email/password. Sets session cookie.",
        "requestBody": {
            "required": True,
            "content": {
                "application/json": {
                    "schema": {"$ref": "#/components/schemas/LoginRequest"},
                    "example": {"email": "user@example.com", "password": "password"}
                }
            }
        },
        "responses": {
            "200": resp_json("Login successful", "#/components/schemas/LoginWebResponse"),
            "401": resp_json("Invalid credentials", "#/components/schemas/ErrorResponse", {"message": ["Credentials not valid"], "status": False})
        }
    }
})

add_path("/logout", {
    "get": {
        "tags": ["Authentication"],
        "summary": "Web Logout",
        "description": "Destroy session and redirect to home.",
        "responses": {"302": {"description": "Redirect to home page"}}
    }
})

add_path("/post/user/data", {
    "post": {
        "tags": ["Authentication"],
        "summary": "Register",
        "description": "Register a new customer or supplier.",
        "requestBody": {
            "required": True,
            "content": {"application/json": {"schema": {"$ref": "#/components/schemas/RegisterRequest"}}}
        },
        "responses": {
            "200": resp_json("Registration successful", "#/components/schemas/SuccessResponse", {"data": [], "status": True}),
            "422": resp_json("Validation error", "#/components/schemas/ValidationErrorResponse")
        }
    }
})

add_path("/forget-password", {
    "post": {
        "tags": ["Authentication"],
        "summary": "Request password reset",
        "requestBody": {
            "required": True,
            "content": {"application/json": {"schema": {"type": "object", "properties": {"email": {"type": "string", "format": "email"}}, "required": ["email"]}}}
        },
        "responses": {"200": resp_json("Email sent", "#/components/schemas/SuccessResponse", {"status": True})}
    }
})

add_path("/validate-forget-password-key", {
    "post": {
        "tags": ["Authentication"],
        "summary": "Validate password reset key",
        "requestBody": {
            "required": True,
            "content": {"application/json": {"schema": {"type": "object", "properties": {"key": {"type": "string"}}, "required": ["key"]}}}
        },
        "responses": {
            "200": resp_json("Key valid", "#/components/schemas/SuccessResponse", {"status": True, "data": {}, "message": "key validated"}),
            "403": resp_json("Invalid or expired key", "#/components/schemas/ErrorResponse", {"status": False, "message": ""})
        }
    }
})

add_path("/save-new-password", {
    "post": {
        "tags": ["Authentication"],
        "summary": "Set new password",
        "requestBody": {
            "required": True,
            "content": {"application/json": {"schema": {"type": "object", "properties": {"key": {"type": "string"}, "newPassword": {"type": "string", "minLength": 6}}, "required": ["key", "newPassword"]}}}
        },
        "responses": {
            "200": resp_json("Password reset", "#/components/schemas/SuccessResponse", {"status": True, "message": "password has been reset successfully"})
        }
    }
})

add_path("/api/user", {
    "get": {
        "tags": ["User & Profile"],
        "summary": "Get authenticated user (Sanctum)",
        "security": [{"bearerAuth": []}],
        "responses": {
            "200": {"description": "Current user", "content": {"application/json": {"schema": {"$ref": "#/components/schemas/User"}}}},
            "401": unauthorized()
        }
    }
})

# ============================================================
# EXTERNAL SUPPLIER API
# ============================================================
add_path("/api/external/supplier/login", {
    "post": {
        "tags": ["External Supplier API"],
        "summary": "Supplier Login",
        "requestBody": {
            "required": True,
            "content": {"application/json": {"schema": {"$ref": "#/components/schemas/LoginRequest"}}}
        },
        "responses": {
            "200": resp_json("Login successful", "#/components/schemas/LoginResponse"),
            "401": resp_json("Invalid credentials", "#/components/schemas/ErrorResponse"),
            "403": resp_json("Not a supplier", "#/components/schemas/ErrorResponse")
        }
    }
})

add_path("/api/external/supplier/logout", {
    "post": {
        "tags": ["External Supplier API"],
        "summary": "Supplier Logout",
        "security": [{"bearerAuth": []}],
        "responses": {
            "200": resp_json("Logged out", "#/components/schemas/SuccessResponse", {"status": True, "message": "Logged out successfully."}),
            "401": unauthorized()
        }
    }
})

add_path("/api/external/supplier/profile", {
    "get": {
        "tags": ["External Supplier API"],
        "summary": "Get Supplier Profile",
        "security": [{"bearerAuth": []}],
        "responses": {
            "200": resp_json("Profile", "#/components/schemas/ProfileResponse"),
            "401": unauthorized()
        }
    }
})

add_path("/api/external/supplier/integration-settings", {
    "put": {
        "tags": ["External Supplier API"],
        "summary": "Update Integration Settings",
        "security": [{"bearerAuth": []}],
        "requestBody": {
            "required": True,
            "content": {"application/json": {"schema": {"$ref": "#/components/schemas/IntegrationSettingsRequest"}}}
        },
        "responses": {
            "200": resp_json("Updated", "#/components/schemas/IntegrationSettingsResponse"),
            "400": resp_json("Bad request", "#/components/schemas/ErrorResponse"),
            "401": unauthorized()
        }
    }
})

add_path("/api/external/supplier/vehicles", {
    "get": {
        "tags": ["External Supplier API"],
        "summary": "List Supplier Vehicles",
        "security": [{"bearerAuth": []}],
        "parameters": [
            {"name": "page", "in": "query", "schema": {"type": "integer", "default": 1}},
            {"name": "per_page", "in": "query", "schema": {"type": "integer", "default": 15}}
        ],
        "responses": {
            "200": resp_json("Vehicles retrieved", "#/components/schemas/PaginatedVehicleResponse"),
            "401": unauthorized()
        }
    },
    "post": {
        "tags": ["External Supplier API"],
        "summary": "Create Vehicle (External)",
        "security": [{"bearerAuth": []}],
        "requestBody": {
            "required": True,
            "content": {
                "multipart/form-data": {"schema": {"$ref": "#/components/schemas/CreateVehicleRequest"}},
                "application/json": {"schema": {"$ref": "#/components/schemas/CreateVehicleRequestJson"}}
            }
        },
        "responses": {
            "201": resp_json("Created", "#/components/schemas/VehicleResponse"),
            "401": unauthorized(),
            "422": resp_json("Validation error", "#/components/schemas/ValidationErrorResponse")
        }
    }
})

add_path("/api/external/supplier/vehicles/{vehicleId}/price", {
    "put": {
        "tags": ["External Supplier API"],
        "summary": "Update Vehicle Price",
        "security": [{"bearerAuth": []}],
        "parameters": [{"name": "vehicleId", "in": "path", "required": True, "schema": {"type": "integer"}}],
        "requestBody": {
            "required": True,
            "content": {"application/json": {"schema": {"$ref": "#/components/schemas/UpdateVehiclePriceRequest"}}}
        },
        "responses": {
            "200": resp_json("Updated", "#/components/schemas/UpdateVehiclePriceResponse"),
            "401": unauthorized(),
            "404": resp_json("Not found", "#/components/schemas/ErrorResponse")
        }
    }
})

add_path("/api/external/supplier/rentals", {
    "get": {
        "tags": ["External Supplier API"],
        "summary": "List Supplier Rentals",
        "security": [{"bearerAuth": []}],
        "parameters": [
            {"name": "page", "in": "query", "schema": {"type": "integer", "default": 1}},
            {"name": "per_page", "in": "query", "schema": {"type": "integer", "default": 15}}
        ],
        "responses": {
            "200": resp_json("Rentals retrieved", "#/components/schemas/PaginatedRentalResponse"),
            "401": unauthorized()
        }
    }
})

add_path("/api/external/supplier/included", {
    "get": {
        "tags": ["External Supplier API"],
        "summary": "Get Included Items",
        "responses": {"200": resp_json("Included items", "#/components/schemas/IncludedListResponse")}
    }
})

add_path("/api/external/supplier/categories", {
    "get": {
        "tags": ["External Supplier API"],
        "summary": "Get Categories",
        "responses": {"200": resp_json("Categories", "#/components/schemas/CategoryListResponse")}
    }
})

add_path("/api/external/supplier/fuel-policies", {
    "get": {
        "tags": ["External Supplier API"],
        "summary": "Get Fuel Policies",
        "responses": {"200": resp_json("Fuel policies", "#/components/schemas/FuelPolicyListResponse")}
    }
})

add_path("/api/external/supplier/location-types", {
    "get": {
        "tags": ["External Supplier API"],
        "summary": "Get Location Types",
        "responses": {"200": resp_json("Location types", "#/components/schemas/LocationTypeListResponse")}
    }
})

add_path("/api/external/supplier/branches", {
    "get": {
        "tags": ["External Supplier API"],
        "summary": "Get Supplier Branches",
        "security": [{"bearerAuth": []}],
        "responses": {
            "200": resp_json("Branches", "#/components/schemas/BranchListResponse"),
            "401": unauthorized()
        }
    }
})

# ============================================================
# REFERENCE DATA
# ============================================================
add_path("/get/countries", {
    "get": {
        "tags": ["Reference Data"],
        "summary": "Get countries",
        "responses": {"200": {"description": "List of country names", "content": {"application/json": {"schema": {"type": "array", "items": {"type": "string"}}, "example": ["USA", "UK", "France"]}}}}
    }
})

add_path("/get/currencies", {
    "get": {
        "tags": ["Reference Data"],
        "summary": "Get currencies",
        "responses": {"200": resp_json("Currencies", "#/components/schemas/CurrencyListResponse")}
    }
})

add_path("/get/logos", {
    "get": {
        "tags": ["Reference Data"],
        "summary": "Get supplier logos",
        "responses": {"200": {"description": "Array of logo filenames", "content": {"application/json": {"schema": {"type": "array", "items": {"type": "string"}}, "example": ["logo1.png", "logo2.png"]}}}}
    }
})

add_path("/get/backgrounds", {
    "get": {
        "tags": ["Reference Data"],
        "summary": "Get background settings",
        "responses": {"200": resp_json("Background settings", "#/components/schemas/BackgroundSettingListResponse")}
    }
})

add_path("/get/photos", {
    "get": {
        "tags": ["Reference Data"],
        "summary": "Get vehicle photos",
        "responses": {"200": resp_json("Vehicle photos", "#/components/schemas/VehiclePhotoListResponse")}
    }
})

add_path("/get/priceTax", {
    "get": {
        "tags": ["Reference Data"],
        "summary": "Get price tax settings",
        "responses": {"200": {"description": "Price taxes", "content": {"application/json": {"schema": {"$ref": "#/components/schemas/PriceTaxResponse"}}}}}
    }
})

add_path("/get/rating/questions", {
    "get": {
        "tags": ["Rates & Reviews"],
        "summary": "Get rating questions",
        "responses": {"200": resp_json("Rating questions", "#/components/schemas/RateQuestionListResponse")}
    }
})

add_path("/get/locations", {
    "get": {
        "tags": ["Reference Data"],
        "summary": "Get branch locations",
        "responses": {"200": resp_json("Locations", "#/components/schemas/BranchListResponse")}
    }
})

add_path("/get/fuel-policies", {
    "get": {
        "tags": ["Fuel Policies"],
        "summary": "Get fuel policies",
        "responses": {"200": resp_json("Fuel policies", "#/components/schemas/FuelPolicyListResponse")}
    }
})

add_path("/get/included", {
    "get": {
        "tags": ["Included"],
        "summary": "Get included items",
        "responses": {"200": resp_json("Included items", "#/components/schemas/IncludedListResponse")}
    }
})

add_path("/get/rental-terms", {
    "get": {
        "tags": ["Rental Terms"],
        "summary": "Get rental terms",
        "responses": {"200": resp_json("Rental terms", "#/components/schemas/RentalTermsListResponse")}
    }
})

add_path("/get/specifications", {
    "get": {
        "tags": ["Specifications"],
        "summary": "Get specifications",
        "responses": {"200": resp_json("Specifications", "#/components/schemas/SpecificationListResponse")}
    }
})

add_path("/get/categories", {
    "get": {
        "tags": ["Categories"],
        "summary": "Get vehicle categories",
        "responses": {"200": resp_json("Categories", "#/components/schemas/CategoryListResponse")}
    }
})

add_path("/get/location-types", {
    "get": {
        "tags": ["Location Types"],
        "summary": "Get location types",
        "responses": {"200": resp_json("Location types", "#/components/schemas/LocationTypeListResponse")}
    }
})

# ============================================================
# VEHICLES
# ============================================================
add_path("/filter/vehicles", {
    "post": {
        "tags": ["Vehicles"],
        "summary": "Filter/search vehicles",
        "requestBody": {
            "required": True,
            "content": {
                "application/json": {
                    "schema": {"$ref": "#/components/schemas/FilterVehicleRequest"},
                    "example": {
                        "pickupLoc": "London",
                        "date_from": "2025-06-01",
                        "date_to": "2025-06-07",
                        "time_from": "10:00",
                        "time_to": "10:00",
                        "currency": "USD",
                        "priceRange": 200,
                        "category": [1, 2],
                        "supplier": [5],
                        "location_type_id": [1],
                        "payment_methods": [2, 3],
                        "specifications": [{"name": "Transmission", "option": ["Automatic"]}]
                    }
                }
            }
        },
        "responses": {
            "200": {"description": "Filtered results", "content": {"application/json": {"schema": {"$ref": "#/components/schemas/VehicleFilterResponse"}}}}
        }
    }
})

add_path("/get/vehicles", {
    "get": {
        "tags": ["Vehicles"],
        "summary": "Get vehicles list",
        "parameters": [
            {"name": "branch_id", "in": "query", "schema": {"type": "integer"}},
            {"name": "supplier", "in": "query", "schema": {"type": "integer"}}
        ],
        "responses": {
            "200": resp_json("Vehicles", "#/components/schemas/VehicleListResponse")
        }
    }
})

add_path("/get/vehicle/data", {
    "post": {
        "tags": ["Vehicles"],
        "summary": "Get single vehicle details",
        "requestBody": {
            "required": True,
            "content": {
                "application/json": {
                    "schema": {
                        "type": "object",
                        "properties": {
                            "id": {"type": "integer"},
                            "location": {"type": "string"},
                            "pickupLoc": {"type": "string"},
                            "date_from": {"type": "string", "format": "date"},
                            "date_to": {"type": "string", "format": "date"},
                            "currency": {"type": "string"}
                        },
                        "required": ["id"]
                    },
                    "example": {"id": 1, "location": "London", "date_from": "2025-06-01", "date_to": "2025-06-07", "currency": "USD"}
                }
            }
        },
        "responses": {
            "200": {"description": "Vehicle details", "content": {"application/json": {"schema": {"$ref": "#/components/schemas/VehicleDetailResponse"}}}}
        }
    }
})

add_path("/search/vehicles", {
    "post": {
        "tags": ["Vehicles"],
        "summary": "Search vehicles (sets session)",
        "requestBody": {
            "required": True,
            "content": {
                "application/json": {
                    "schema": {
                        "type": "object",
                        "properties": {
                            "pickupLoc": {"type": "string"},
                            "date": {"type": "string"},
                            "currency": {"type": "string"}
                        }
                    },
                    "example": {"pickupLoc": "London", "date": "2025-06-01", "currency": "USD"}
                }
            }
        },
        "responses": {"302": {"description": "Redirect to results page"}}
    }
})

add_path("/get/filtered/specifications", {
    "post": {
        "tags": ["Vehicles"],
        "summary": "Get filtered specifications",
        "requestBody": {
            "required": True,
            "content": {
                "application/json": {
                    "schema": {"type": "object", "properties": {"vehicle_ids": {"type": "array", "items": {"type": "integer"}}}},
                    "example": {"vehicle_ids": [1, 2, 3]}
                }
            }
        },
        "responses": {
            "200": resp_json("Specifications with counts", "#/components/schemas/SpecificationListResponse")
        }
    }
})

add_path("/api/jimpisoft/refresh-prices", {
    "post": {
        "tags": ["Vehicles"],
        "summary": "Refresh Jimpisoft prices",
        "requestBody": {
            "required": True,
            "content": {
                "application/json": {
                    "schema": {
                        "type": "object",
                        "properties": {
                            "pickupLoc": {"type": "string"},
                            "date_from": {"type": "string", "format": "date"},
                            "date_to": {"type": "string", "format": "date"}
                        },
                        "required": ["pickupLoc", "date_from", "date_to"]
                    },
                    "example": {"pickupLoc": "London", "date_from": "2025-06-01", "date_to": "2025-06-07"}
                }
            }
        },
        "responses": {
            "200": resp_json("Prices refreshed", "#/components/schemas/SuccessResponse", {"status": True, "fresh": True, "message": "Prices refreshed successfully.", "data": {"branches_updated": [1], "vehicles_updated": 5, "prices": {}}}),
            "422": resp_json("Missing parameters", "#/components/schemas/ErrorResponse"),
            "404": resp_json("No branches/vehicles found", "#/components/schemas/ErrorResponse")
        }
    }
})

# ============================================================
# SUPPLIER VEHICLES
# ============================================================
add_path("/post/vehicles", {
    "post": {
        "tags": ["Supplier"],
        "summary": "Create or update vehicle",
        "description": "Requires active_supplier middleware. Set `update=1` and provide `id` to update an existing vehicle.",
        "requestBody": {
            "required": True,
            "content": {"application/json": {"schema": {"$ref": "#/components/schemas/CreateEditVehicleRequest"}}}
        },
        "responses": {
            "200": resp_json("Vehicle saved", "#/components/schemas/VehicleResponse")
        }
    }
})

add_path("/edit/vehicles/{id}", {
    "get": {
        "tags": ["Supplier"],
        "summary": "Get vehicle for editing",
        "parameters": [{"name": "id", "in": "path", "required": True, "schema": {"type": "integer"}}],
        "responses": {"200": resp_json("Vehicle edit data", "#/components/schemas/VehicleEditResponse")}
    }
})

add_path("/edit-vehicle-price", {
    "post": {
        "tags": ["Supplier"],
        "summary": "Update vehicle price",
        "requestBody": {
            "required": True,
            "content": {
                "application/json": {
                    "schema": {"type": "object", "properties": {"id": {"type": "integer"}, "price": {"type": "number"}, "week_price": {"type": "number"}, "month_price": {"type": "number"}}, "required": ["id"]},
                    "example": {"id": 1, "price": 50.0, "week_price": 45.0, "month_price": 40.0}
                }
            }
        },
        "responses": {"200": resp_json("Price updated", "#/components/schemas/SuccessResponse", {"data": {}, "status": True})}
    }
})

add_path("/update/vehicles/activation", {
    "post": {
        "tags": ["Supplier"],
        "summary": "Toggle vehicle activation",
        "requestBody": {
            "required": True,
            "content": {
                "application/json": {
                    "schema": {"type": "object", "properties": {"vehicle_id": {"type": "integer"}, "activation": {"type": "boolean"}}, "required": ["vehicle_id", "activation"]},
                    "example": {"vehicle_id": 1, "activation": False}
                }
            }
        },
        "responses": {"200": {"description": "Activation updated"}}
    }
})

add_path("/delete/vehicles/{id}", {
    "post": {
        "tags": ["Supplier"],
        "summary": "Delete vehicle",
        "parameters": [{"name": "id", "in": "path", "required": True, "schema": {"type": "integer"}}],
        "responses": {"200": resp_json("Deleted", "#/components/schemas/SuccessResponse", {"status": True, "message": "deleted successfully"})}
    }
})

add_path("/vehicles/bulk-upload", {
    "post": {
        "tags": ["Admin"],
        "summary": "Bulk upload vehicles via Excel",
        "requestBody": {
            "required": True,
            "content": {
                "multipart/form-data": {
                    "schema": {
                        "type": "object",
                        "properties": {"file": {"type": "string", "format": "binary"}, "branch": {"type": "integer"}, "supplier": {"type": "integer"}},
                        "required": ["file", "branch"]
                    }
                }
            }
        },
        "responses": {"200": resp_json("Upload result", "#/components/schemas/BulkUploadResponse")}
    }
})

add_path("/vehicles/bulk-upload/template", {
    "get": {
        "tags": ["Admin"],
        "summary": "Download bulk upload template",
        "responses": {
            "200": {"description": "Excel file download", "content": {"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {"schema": {"type": "string", "format": "binary"}}}}
        }
    }
})

# ============================================================
# BOOKINGS & RENTALS
# ============================================================
add_path("/book/vehicles", {
    "post": {
        "tags": ["Customer"],
        "summary": "Book a vehicle",
        "requestBody": {
            "required": True,
            "content": {
                "application/json": {
                    "schema": {
                        "type": "object",
                        "properties": {
                            "id": {"type": "integer", "description": "Vehicle ID"},
                            "date_from": {"type": "string", "format": "date"},
                            "date_to": {"type": "string", "format": "date"},
                            "time_from": {"type": "string"},
                            "time_to": {"type": "string"},
                            "currency": {"type": "string"},
                            "old_rental_id": {"type": "integer", "nullable": True}
                        },
                        "required": ["id", "date_from", "date_to", "currency"]
                    },
                    "example": {"id": 1, "date_from": "2025-06-01", "date_to": "2025-06-07", "time_from": "10:00", "time_to": "10:00", "currency": "USD"}
                }
            }
        },
        "responses": {
            "200": resp_json("Booking created", "#/components/schemas/RentalResponse", {"data": {"id": 1, "order_number": "USATR0001", "vehicle_id": 1, "price": 350.0, "order_status": 1}, "status": True}),
            "500": resp_json("Server error", "#/components/schemas/ErrorResponse")
        }
    }
})

add_path("/cancel/booking", {
    "post": {
        "tags": ["Customer"],
        "summary": "Cancel booking",
        "requestBody": {
            "required": True,
            "content": {"application/json": {"schema": {"type": "object", "properties": {"id": {"type": "integer"}}, "required": ["id"]}, "example": {"id": 1}}}
        },
        "responses": {
            "200": resp_json("Cancelled", "#/components/schemas/SuccessResponse", {"data": [], "message": "Order has benn canceled"}),
            "403": resp_json("Cannot cancel", "#/components/schemas/ErrorResponse")
        }
    }
})

add_path("/get/rentals", {
    "get": {
        "tags": ["Bookings & Rentals"],
        "summary": "Get rentals (supplier or admin)",
        "parameters": [
            {"name": "order_status", "in": "query", "schema": {"type": "integer"}},
            {"name": "order_number", "in": "query", "schema": {"type": "string"}},
            {"name": "country", "in": "query", "schema": {"type": "string"}},
            {"name": "date_range", "in": "query", "schema": {"type": "array", "items": {"type": "string"}}},
            {"name": "has_review", "in": "query", "schema": {"type": "boolean"}}
        ],
        "responses": {
            "200": resp_json("Rentals list", "#/components/schemas/RentalListWithStatusesResponse")
        }
    }
})

add_path("/get/rentals/admin", {
    "get": {
        "tags": ["Admin"],
        "summary": "Get all rentals (admin)",
        "parameters": [
            {"name": "supplier_id", "in": "query", "schema": {"type": "integer"}},
            {"name": "order_status", "in": "query", "schema": {"type": "integer"}},
            {"name": "order_number", "in": "query", "schema": {"type": "string"}},
            {"name": "country", "in": "query", "schema": {"type": "string"}},
            {"name": "date_range", "in": "query", "schema": {"type": "array", "items": {"type": "string"}}},
            {"name": "has_review", "in": "query", "schema": {"type": "boolean"}}
        ],
        "responses": {"200": resp_json("Admin rentals", "#/components/schemas/RentalListWithStatusesResponse")}
    }
})

add_path("/booking/{id}", {
    "get": {
        "tags": ["Bookings & Rentals"],
        "summary": "Get booking details",
        "parameters": [{"name": "id", "in": "path", "required": True, "schema": {"type": "integer"}}],
        "responses": {"200": resp_json("Booking details", "#/components/schemas/RentalResponse")}
    }
})

add_path("/invoice/booking/{id}", {
    "get": {
        "tags": ["Customer"],
        "summary": "Download booking invoice PDF",
        "parameters": [{"name": "id", "in": "path", "required": True, "schema": {"type": "integer"}}],
        "responses": {
            "200": {"description": "PDF download", "content": {"application/pdf": {"schema": {"type": "string", "format": "binary"}}}}
        }
    }
})

add_path("/get/supplier/invoice", {
    "get": {
        "tags": ["Admin"],
        "summary": "Get supplier invoice summary",
        "parameters": [{"name": "company_id", "in": "query", "required": True, "schema": {"type": "integer"}}],
        "responses": {
            "200": resp_json("Invoice data", "#/components/schemas/SupplierInvoiceResponse")
        }
    }
})

add_path("/rentals/reconcile", {
    "post": {
        "tags": ["Admin"],
        "summary": "Reconcile supplier rentals",
        "requestBody": {
            "required": True,
            "content": {"application/json": {"schema": {"type": "object", "properties": {"supplier_id": {"type": "integer"}}, "required": ["supplier_id"]}, "example": {"supplier_id": 5}}}
        },
        "responses": {
            "200": resp_json("Reconciled", "#/components/schemas/SuccessResponse", {"status": True, "data": []})
        }
    }
})

add_path("/booking/update-status", {
    "get": {
        "tags": ["Bookings & Rentals"],
        "summary": "Update booking status",
        "parameters": [
            {"name": "request", "in": "query", "required": True, "schema": {"type": "string", "description": "Base64-encoded JSON with rental_id"}},
            {"name": "status", "in": "query", "required": True, "schema": {"type": "integer"}}
        ],
        "responses": {"200": {"description": "Status updated"}}
    }
})

add_path("/rental/rate/{id}", {
    "get": {
        "tags": ["Bookings & Rentals"],
        "summary": "Get rental with ratings",
        "parameters": [{"name": "id", "in": "path", "required": True, "schema": {"type": "integer"}}],
        "responses": {"200": resp_json("Rental with rates", "#/components/schemas/RentalWithRatesResponse")}
    }
})

add_path("/rating", {
    "post": {
        "tags": ["Rates & Reviews"],
        "summary": "Submit rating",
        "requestBody": {
            "required": True,
            "content": {"application/json": {"schema": {"type": "object", "properties": {"rental_id": {"type": "integer"}, "rate": {"type": "number"}, "comment": {"type": "string"}}, "required": ["rental_id", "rate"]}, "example": {"rental_id": 1, "rate": 4.5, "comment": "Great service!"}}}
        },
        "responses": {"200": resp_json("Rating saved", "#/components/schemas/SuccessResponse")}
    }
})

# ============================================================
# USERS & PROFILE
# ============================================================
add_path("/get/user/data", {
    "get": {
        "tags": ["User & Profile"],
        "summary": "Get current user",
        "responses": {"200": {"description": "Current user object", "content": {"application/json": {"schema": {"$ref": "#/components/schemas/User"}}}}}
    }
})

add_path("/my-current-user-profile", {
    "get": {
        "tags": ["User & Profile"],
        "summary": "Get customer profile with rentals",
        "responses": {"200": resp_json("User profile", "#/components/schemas/UserProfileResponse")}
    }
})

add_path("/get/user/role", {
    "get": {
        "tags": ["User & Profile"],
        "summary": "Get current user role",
        "responses": {"200": {"description": "Role string or null"}}
    }
})

add_path("/get/companies", {
    "get": {
        "tags": ["User & Profile"],
        "summary": "Get companies/suppliers",
        "responses": {"200": resp_json("Companies", "#/components/schemas/UserListResponse")}
    }
})

add_path("/get/suppliers", {
    "get": {
        "tags": ["User & Profile"],
        "summary": "Get active suppliers",
        "parameters": [{"name": "country", "in": "query", "schema": {"type": "string"}}],
        "responses": {"200": resp_json("Suppliers", "#/components/schemas/UserListResponse")}
    }
})

add_path("/get/customers", {
    "get": {
        "tags": ["Admin"],
        "summary": "Get all customers",
        "responses": {"200": resp_json("Customers", "#/components/schemas/UserListResponse")}
    }
})

add_path("/delete/customers", {
    "post": {
        "tags": ["Admin"],
        "summary": "Delete a customer",
        "requestBody": {
            "required": True,
            "content": {"application/json": {"schema": {"type": "object", "properties": {"id": {"type": "integer"}}, "required": ["id"]}, "example": {"id": 1}}}
        },
        "responses": {"200": resp_json("Deleted", "#/components/schemas/SuccessResponse", {"data": [], "status": 1, "message": "Customer deleted successfully"})}
    }
})

add_path("/assign-parent", {
    "post": {
        "tags": ["Admin"],
        "summary": "Assign parent company",
        "requestBody": {
            "required": True,
            "content": {"application/json": {"schema": {"type": "object", "properties": {"selectedCompany": {"type": "integer"}, "parentCompany": {"type": "integer"}}, "required": ["selectedCompany", "parentCompany"]}, "example": {"selectedCompany": 2, "parentCompany": 1}}}
        },
        "responses": {"200": {"description": "Assignment result", "content": {"application/json": {"schema": {"type": "object", "properties": {"success": {"type": "boolean"}}}}}}}
    }
})

add_path("/upload", {
    "post": {
        "tags": ["User & Profile"],
        "summary": "Upload user profile/logo",
        "requestBody": {
            "required": True,
            "content": {
                "multipart/form-data": {
                    "schema": {
                        "type": "object",
                        "properties": {
                            "logo": {"type": "string", "format": "binary"},
                            "newPass": {"type": "string"},
                            "oldPass": {"type": "string"},
                            "confirmNewPass": {"type": "string"}
                        }
                    }
                }
            }
        },
        "responses": {"200": {"description": "Upload result", "content": {"application/json": {"schema": {"type": "object", "properties": {"message": {"type": "integer"}}}}}}}
    }
})

add_path("/change-company", {
    "post": {
        "tags": ["Supplier"],
        "summary": "Switch to another company account",
        "requestBody": {
            "required": True,
            "content": {"application/json": {"schema": {"type": "object", "properties": {"selectedCompany": {"type": "integer"}}, "required": ["selectedCompany"]}, "example": {"selectedCompany": 2}}}
        },
        "responses": {"200": {"description": "Switched"}}
    }
})

# ============================================================
# BRANCHES
# ============================================================
add_path("/get/branches", {
    "get": {
        "tags": ["Branches"],
        "summary": "Get branches",
        "parameters": [
            {"name": "company_id", "in": "query", "schema": {"type": "integer"}},
            {"name": "country", "in": "query", "schema": {"type": "string"}}
        ],
        "responses": {"200": resp_json("Branches", "#/components/schemas/BranchListResponse")}
    }
})

add_path("/upload/branch", {
    "post": {
        "tags": ["Supplier"],
        "summary": "Create branch",
        "requestBody": {
            "required": True,
            "content": {
                "application/json": {
                    "schema": {"$ref": "#/components/schemas/BranchRequest"},
                    "example": {"name": "Downtown Branch", "location": "London", "adresse": "123 Main St", "country": "UK", "pickup_type": "Airport", "city": "London", "phone": "+44 20 1234 5678", "lat": 51.5074, "lng": -0.1278, "email": "branch@example.com", "currency": "GBP"}
                }
            }
        },
        "responses": {"200": resp_json("Branch created", "#/components/schemas/SuccessResponse", {"message": "Branch created successfully", "status": True})}
    }
})

add_path("/delete/branches", {
    "post": {
        "tags": ["Supplier"],
        "summary": "Delete branch",
        "requestBody": {
            "required": True,
            "content": {"application/json": {"schema": {"type": "object", "properties": {"id": {"type": "integer"}}, "required": ["id"]}, "example": {"id": 1}}}
        },
        "responses": {"200": resp_json("Deleted", "#/components/schemas/SuccessResponse", {"message": "Branch deleted successfully"})}
    }
})

add_path("/branches/edit/{id}", {
    "get": {
        "tags": ["Supplier"],
        "summary": "Get branch for edit",
        "parameters": [{"name": "id", "in": "path", "required": True, "schema": {"type": "integer"}}],
        "responses": {"200": resp_json("Branch data", "#/components/schemas/BranchResponse")}
    }
})

add_path("/branches/update", {
    "post": {
        "tags": ["Supplier"],
        "summary": "Update branch",
        "requestBody": {"required": True, "content": {"application/json": {"schema": {"$ref": "#/components/schemas/BranchRequest"}}}},
        "responses": {"200": {"description": "Branch updated"}}
    }
})

# ============================================================
# BLOG CATEGORIES
# ============================================================
add_path("/api/blog-categories", {
    "get": {
        "tags": ["Blog Categories"],
        "summary": "List all blog categories",
        "responses": {"200": resp_json("Categories", "#/components/schemas/BlogCategoryListResponse")}
    },
    "post": {
        "tags": ["Blog Categories"],
        "summary": "Create blog category",
        "security": [{"bearerAuth": []}],
        "requestBody": {
            "required": True,
            "content": {"application/json": {"schema": {"$ref": "#/components/schemas/BlogCategoryRequest"}, "example": {"title": "Travel Tips", "activation": True}}}
        },
        "responses": {
            "201": resp_json("Created", "#/components/schemas/BlogCategoryResponse"),
            "422": resp_json("Validation error", "#/components/schemas/ValidationErrorResponse")
        }
    }
})

add_path("/api/blog-categories/active", {
    "get": {
        "tags": ["Blog Categories"],
        "summary": "List active blog categories",
        "responses": {"200": resp_json("Active categories", "#/components/schemas/BlogCategoryListResponse")}
    }
})

add_path("/api/blog-categories/{blogCategory}", {
    "get": {
        "tags": ["Blog Categories"],
        "summary": "Get blog category",
        "parameters": [{"name": "blogCategory", "in": "path", "required": True, "schema": {"type": "integer"}}],
        "responses": {"200": resp_json("Category", "#/components/schemas/BlogCategoryResponse")}
    },
    "put": {
        "tags": ["Blog Categories"],
        "summary": "Update blog category",
        "security": [{"bearerAuth": []}],
        "parameters": [{"name": "blogCategory", "in": "path", "required": True, "schema": {"type": "integer"}}],
        "requestBody": {
            "required": True,
            "content": {"application/json": {"schema": {"$ref": "#/components/schemas/BlogCategoryRequest"}}}
        },
        "responses": {"200": resp_json("Updated", "#/components/schemas/BlogCategoryResponse")}
    },
    "delete": {
        "tags": ["Blog Categories"],
        "summary": "Delete blog category",
        "security": [{"bearerAuth": []}],
        "parameters": [{"name": "blogCategory", "in": "path", "required": True, "schema": {"type": "integer"}}],
        "responses": {"200": resp_json("Deleted", "#/components/schemas/SuccessResponse")}
    }
})

add_path("/api/blog-categories/{category}/blogs", {
    "get": {
        "tags": ["Blog Categories"],
        "summary": "Get blogs by category",
        "parameters": [
            {"name": "category", "in": "path", "required": True, "schema": {"type": "integer"}},
            {"name": "is_published", "in": "query", "schema": {"type": "boolean"}},
            {"name": "per_page", "in": "query", "schema": {"type": "integer", "default": 15}}
        ],
        "responses": {"200": resp_json("Blogs", "#/components/schemas/BlogCategoryWithBlogsResponse")}
    }
})

add_path("/api/blog-categories/{blogCategory}/toggle-activation", {
    "patch": {
        "tags": ["Blog Categories"],
        "summary": "Toggle category activation",
        "security": [{"bearerAuth": []}],
        "parameters": [{"name": "blogCategory", "in": "path", "required": True, "schema": {"type": "integer"}}],
        "responses": {"200": resp_json("Toggled", "#/components/schemas/BlogCategoryResponse")}
    }
})

# ============================================================
# BLOGS
# ============================================================
add_path("/api/blogs", {
    "get": {
        "tags": ["Blog"],
        "summary": "List all blogs",
        "parameters": [
            {"name": "category_id", "in": "query", "schema": {"type": "integer"}},
            {"name": "is_published", "in": "query", "schema": {"type": "boolean"}},
            {"name": "per_page", "in": "query", "schema": {"type": "integer", "default": 15}}
        ],
        "responses": {"200": resp_json("Blogs list", "#/components/schemas/BlogPaginatedResponse")}
    }
})

add_path("/api/blogs/published", {
    "get": {
        "tags": ["Blog"],
        "summary": "List published blogs",
        "parameters": [
            {"name": "category_id", "in": "query", "schema": {"type": "integer"}},
            {"name": "per_page", "in": "query", "schema": {"type": "integer", "default": 15}}
        ],
        "responses": {"200": resp_json("Published blogs", "#/components/schemas/BlogPaginatedResponse")}
    }
})

add_path("/api/blogs/{blog}", {
    "get": {
        "tags": ["Blog"],
        "summary": "Get blog by ID",
        "parameters": [{"name": "blog", "in": "path", "required": True, "schema": {"type": "integer"}}],
        "responses": {"200": resp_json("Blog", "#/components/schemas/BlogResponse")}
    }
})

add_path("/api/blogs/slug/{slug}", {
    "get": {
        "tags": ["Blog"],
        "summary": "Get blog by slug",
        "parameters": [{"name": "slug", "in": "path", "required": True, "schema": {"type": "string"}}],
        "responses": {
            "200": resp_json("Blog", "#/components/schemas/BlogResponse"),
            "404": resp_json("Not found", "#/components/schemas/ErrorResponse")
        }
    }
})

add_path("/api/blogs/{blog}/toggle-publish", {
    "patch": {
        "tags": ["Blog"],
        "summary": "Toggle blog publish status",
        "security": [{"bearerAuth": []}],
        "parameters": [{"name": "blog", "in": "path", "required": True, "schema": {"type": "integer"}}],
        "responses": {"200": resp_json("Toggled", "#/components/schemas/BlogResponse")}
    }
})

# Web blog admin routes
add_path("/api/blogs-admin-store", {
    "post": {
        "tags": ["Blog"],
        "summary": "Create blog (admin web route: POST /api/blogs)",
        "requestBody": {
            "required": True,
            "content": {"multipart/form-data": {"schema": {"$ref": "#/components/schemas/BlogFormRequest"}}}
        },
        "responses": {"201": resp_json("Created", "#/components/schemas/BlogResponse")}
    }
})

add_path("/api/blogs-admin-update/{blog}", {
    "post": {
        "tags": ["Blog"],
        "summary": "Update blog (admin web route: POST /api/blogs/{blog})",
        "parameters": [{"name": "blog", "in": "path", "required": True, "schema": {"type": "integer"}}],
        "requestBody": {
            "required": True,
            "content": {"multipart/form-data": {"schema": {"$ref": "#/components/schemas/BlogFormRequest"}}}
        },
        "responses": {"200": resp_json("Updated", "#/components/schemas/BlogResponse")}
    }
})

add_path("/api/blogs-admin-delete/{blog}", {
    "delete": {
        "tags": ["Blog"],
        "summary": "Delete blog (admin web route: DELETE /api/blogs/{blog})",
        "parameters": [{"name": "blog", "in": "path", "required": True, "schema": {"type": "integer"}}],
        "responses": {"200": resp_json("Deleted", "#/components/schemas/SuccessResponse")}
    }
})

# ============================================================
# ADMIN
# ============================================================
admin_ops = [
    ("/post/categories", "post", "Categories", "Create category", "#/components/schemas/CategoryRequest", None),
    ("/update/categories", "post", "Categories", "Update category", "#/components/schemas/CategoryUpdateRequest", None),
    ("/delete/categories", "post", "Categories", "Delete category", None, {"type": "object", "properties": {"id": {"type": "integer"}}, "required": ["id"]}),
    ("/post/specifications", "post", "Specifications", "Create specification", "#/components/schemas/SpecificationRequest", None),
    ("/specifications/update", "post", "Specifications", "Update specification", "#/components/schemas/SpecificationUpdateRequest", None),
    ("/delete/specifications", "post", "Specifications", "Delete specification", None, {"type": "object", "properties": {"id": {"type": "integer"}}, "required": ["id"]}),
    ("/post/included", "post", "Included", "Create included item", "#/components/schemas/IncludedRequest", None),
    ("/delete/included", "post", "Included", "Delete included item", None, {"type": "object", "properties": {"id": {"type": "integer"}}, "required": ["id"]}),
    ("/post/rental-terms", "post", "Rental Terms", "Create rental term", "#/components/schemas/RentalTermsRequest", None),
    ("/delete/rental-terms", "post", "Rental Terms", "Delete rental term", None, {"type": "object", "properties": {"id": {"type": "integer"}}, "required": ["id"]}),
    ("/edit/rental-terms", "post", "Rental Terms", "Edit rental term", "#/components/schemas/RentalTermsUpdateRequest", None),
    ("/show/rental-terms", "post", "Rental Terms", "Get single rental term", None, {"type": "object", "properties": {"id": {"type": "integer"}}, "required": ["id"]}),
    ("/update/rental-terms/status", "post", "Rental Terms", "Approve or reject rental term", "#/components/schemas/RentalTermsStatusRequest", None),
]

for path, method, tag, summary, req_schema, req_inline in admin_ops:
    op = {"tags": [tag], "summary": summary, "responses": {"200": {"description": "Success"}}}
    if req_schema:
        op["requestBody"] = {"required": True, "content": {"application/json": {"schema": {"$ref": req_schema}}}}
    elif req_inline:
        op["requestBody"] = {"required": True, "content": {"application/json": {"schema": req_inline}}}
    add_path(path, {method: op})

add_path("/select-rental-terms", {
    "post": {
        "tags": ["Supplier"],
        "summary": "Assign rental terms to supplier",
        "requestBody": {
            "required": True,
            "content": {"application/json": {"schema": {"type": "object", "properties": {"rental_term_id": {"type": "integer"}}, "required": ["rental_term_id"]}, "example": {"rental_term_id": 1}}}
        },
        "responses": {"200": {"description": "Assigned"}}
    }
})

add_path("/get/requests", {
    "get": {
        "tags": ["Admin"],
        "summary": "Get membership requests",
        "responses": {"200": resp_json("Requests", "#/components/schemas/UserListResponse")}
    }
})

add_path("/accept/requests", {
    "post": {
        "tags": ["Admin"],
        "summary": "Accept membership request",
        "requestBody": {
            "required": True,
            "content": {"application/json": {"schema": {"type": "object", "properties": {"id": {"type": "integer"}}, "required": ["id"]}, "example": {"id": 1}}}
        },
        "responses": {"200": {"description": "Request accepted"}}
    }
})

add_path("/delete/requests", {
    "post": {
        "tags": ["Admin"],
        "summary": "Delete/reject membership request",
        "requestBody": {
            "required": True,
            "content": {"application/json": {"schema": {"type": "object", "properties": {"id": {"type": "integer"}}, "required": ["id"]}, "example": {"id": 1}}}
        },
        "responses": {"200": {"description": "Request deleted"}}
    }
})

add_path("/post/request", {
    "post": {
        "tags": ["Customer"],
        "summary": "Submit membership request",
        "responses": {"200": resp_json("Requested", "#/components/schemas/SuccessResponse", {"message": "Role updated successfully"})}
    }
})

add_path("/post/photos", {
    "post": {
        "tags": ["Admin"],
        "summary": "Upload vehicle photo",
        "requestBody": {
            "required": True,
            "content": {
                "multipart/form-data": {
                    "schema": {
                        "type": "object",
                        "properties": {"name": {"type": "string"}, "photo": {"type": "string", "format": "binary"}},
                        "required": ["photo"]
                    }
                }
            }
        },
        "responses": {"200": {"description": "Photo uploaded"}}
    }
})

add_path("/delete/photos", {
    "post": {
        "tags": ["Admin"],
        "summary": "Delete vehicle photo",
        "requestBody": {
            "required": True,
            "content": {"application/json": {"schema": {"type": "object", "properties": {"id": {"type": "integer"}}, "required": ["id"]}, "example": {"id": 1}}}
        },
        "responses": {"200": {"description": "Photo deleted"}}
    }
})

add_path("/profit/upload", {
    "post": {
        "tags": ["Admin"],
        "summary": "Upload profit margins",
        "requestBody": {
            "required": True,
            "content": {"multipart/form-data": {"schema": {"type": "object", "properties": {"file": {"type": "string", "format": "binary"}}}}}
        },
        "responses": {"200": {"description": "Profits uploaded"}}
    }
})

add_path("/get/profit", {
    "get": {
        "tags": ["Admin"],
        "summary": "Get profit margins",
        "responses": {"200": resp_json("Profit data", "#/components/schemas/ProfitResponse")}
    }
})

add_path("/get/subscribers", {
    "get": {
        "tags": ["Subscribers"],
        "summary": "Get subscribers",
        "responses": {"200": resp_json("Subscribers list", "#/components/schemas/SubscriberListResponse")}
    }
})

add_path("/delete/subscribers", {
    "post": {
        "tags": ["Subscribers"],
        "summary": "Delete subscriber",
        "requestBody": {
            "required": True,
            "content": {"application/json": {"schema": {"type": "object", "properties": {"id": {"type": "integer"}}, "required": ["id"]}, "example": {"id": 1}}}
        },
        "responses": {"200": {"description": "Subscriber deleted"}}
    }
})

add_path("/send-email", {
    "post": {
        "tags": ["Subscribers"],
        "summary": "Send email to subscribers",
        "requestBody": {
            "required": True,
            "content": {"application/json": {"schema": {"type": "object", "properties": {"subject": {"type": "string"}, "message": {"type": "string"}}, "required": ["subject", "message"]}, "example": {"subject": "Newsletter", "message": "Hello subscribers!"}}}
        },
        "responses": {"200": {"description": "Email sent"}}
    }
})

# ============================================================
# PAYMENT METHODS & PROMOS
# ============================================================
add_path("/get/payment_methods", {
    "get": {
        "tags": ["Payment Methods"],
        "summary": "Get payment methods",
        "responses": {"200": resp_json("Payment methods", "#/components/schemas/PaymentMethodListResponse")}
    }
})

add_path("/payment_methods", {
    "post": {
        "tags": ["Payment Methods"],
        "summary": "Store supplier payment methods",
        "requestBody": {
            "required": True,
            "content": {"application/json": {"schema": {"type": "object", "properties": {"payment_methods": {"type": "array", "items": {"type": "integer"}}}, "required": ["payment_methods"]}, "example": {"payment_methods": [1, 2, 3]}}}
        },
        "responses": {"200": {"description": "Payment methods saved"}}
    }
})

add_path("/promo", {
    "get": {
        "tags": ["Promos"],
        "summary": "Get promos",
        "responses": {"200": resp_json("Promos", "#/components/schemas/PromoListResponse")}
    },
    "post": {
        "tags": ["Promos"],
        "summary": "Create promo",
        "requestBody": {
            "required": True,
            "content": {"application/json": {"schema": {"type": "object", "properties": {"vehicle_id": {"type": "integer"}, "included_id": {"type": "integer"}}, "required": ["vehicle_id", "included_id"]}, "example": {"vehicle_id": 1, "included_id": 2}}}
        },
        "responses": {"200": {"description": "Promo created"}}
    }
})

add_path("/promo/{id}", {
    "delete": {
        "tags": ["Promos"],
        "summary": "Delete promo",
        "parameters": [{"name": "id", "in": "path", "required": True, "schema": {"type": "integer"}}],
        "responses": {"200": {"description": "Promo deleted"}}
    }
})

# ============================================================
# DASHBOARD
# ============================================================
add_path("/dashboard", {
    "get": {
        "tags": ["Dashboard"],
        "summary": "Get admin dashboard stats",
        "responses": {"200": resp_json("Dashboard data", "#/components/schemas/DashboardResponse")}
    }
})

add_path("/supplier-dashboard", {
    "get": {
        "tags": ["Dashboard"],
        "summary": "Get supplier dashboard stats",
        "responses": {"200": resp_json("Dashboard data", "#/components/schemas/SupplierDashboardResponse")}
    }
})

# ============================================================
# BACKGROUND SETTINGS
# ============================================================
add_path("/api/background-settings", {
    "get": {
        "tags": ["Background Settings"],
        "summary": "Get background settings",
        "responses": {"200": resp_json("Background settings", "#/components/schemas/BackgroundSettingListResponse")}
    }
})

add_path("/api/background-settings/{id}", {
    "post": {
        "tags": ["Background Settings"],
        "summary": "Update background setting",
        "parameters": [{"name": "id", "in": "path", "required": True, "schema": {"type": "integer"}}],
        "requestBody": {
            "required": True,
            "content": {
                "multipart/form-data": {
                    "schema": {
                        "type": "object",
                        "properties": {"image": {"type": "string", "format": "binary"}, "is_active": {"type": "boolean"}}
                    }
                }
            }
        },
        "responses": {"200": {"description": "Setting updated"}}
    }
})

add_path("/api/background-settings/{id}/reset", {
    "post": {
        "tags": ["Background Settings"],
        "summary": "Reset background to default",
        "parameters": [{"name": "id", "in": "path", "required": True, "schema": {"type": "integer"}}],
        "responses": {"200": {"description": "Reset successful"}}
    }
})

# ============================================================
# SUPPLIER RENTALS
# ============================================================
add_path("/accept/rentals", {
    "post": {
        "tags": ["Supplier"],
        "summary": "Accept rental",
        "requestBody": {
            "required": True,
            "content": {"application/json": {"schema": {"type": "object", "properties": {"id": {"type": "integer"}}, "required": ["id"]}, "example": {"id": 1}}}
        },
        "responses": {"200": {"description": "Rental accepted"}}
    }
})

add_path("/delete/rentals", {
    "post": {
        "tags": ["Supplier"],
        "summary": "Delete/reject rental",
        "requestBody": {
            "required": True,
            "content": {"application/json": {"schema": {"type": "object", "properties": {"id": {"type": "integer"}}, "required": ["id"]}, "example": {"id": 1}}}
        },
        "responses": {"200": {"description": "Rental deleted"}}
    }
})

# ============================================================
# SCHEMAS
# ============================================================
spec["components"]["schemas"] = {
    # ---- Base / Shared ----
    "SuccessResponse": {
        "type": "object",
        "properties": {
            "status": {"type": "boolean", "example": True},
            "message": {"type": "string", "example": "Success"},
            "data": {"type": "object"}
        }
    },
    "ErrorResponse": {
        "type": "object",
        "properties": {
            "status": {"type": "boolean", "example": False},
            "message": {"type": "string", "example": "Error message"}
        }
    },
    "ValidationErrorResponse": {
        "type": "object",
        "properties": {
            "message": {"type": "string", "example": "The given data was invalid."},
            "errors": {"type": "object", "additionalProperties": {"type": "array", "items": {"type": "string"}}}
        }
    },

    # ---- Auth ----
    "LoginRequest": {
        "type": "object",
        "required": ["email", "password"],
        "properties": {
            "email": {"type": "string", "format": "email", "example": "supplier@example.com"},
            "password": {"type": "string", "format": "password", "example": "password"}
        }
    },
    "LoginResponse": {
        "type": "object",
        "properties": {
            "status": {"type": "boolean", "example": True},
            "message": {"type": "string", "example": "Login successful."},
            "data": {
                "type": "object",
                "properties": {
                    "user": {"$ref": "#/components/schemas/User"},
                    "token": {"type": "string", "example": "1|abc123"},
                    "token_type": {"type": "string", "example": "Bearer"}
                }
            }
        }
    },
    "LoginWebResponse": {
        "type": "object",
        "properties": {
            "data": {"type": "array", "items": {"type": "object"}, "example": []},
            "status": {"type": "boolean", "example": True},
            "children": {"type": "integer", "example": 0},
            "user_type": {"type": "string", "example": "customer"}
        }
    },
    "RegisterRequest": {
        "type": "object",
        "required": ["name", "email", "password"],
        "properties": {
            "name": {"type": "string", "example": "John Doe"},
            "email": {"type": "string", "format": "email"},
            "password": {"type": "string", "minLength": 8},
            "phone": {"type": "string"},
            "country": {"type": "string"},
            "supplier": {"type": "integer", "enum": [0, 1], "description": "1 for supplier, 0 for customer"}
        }
    },

    # ---- User ----
    "User": {
        "type": "object",
        "properties": {
            "id": {"type": "integer", "example": 1},
            "name": {"type": "string", "example": "John Doe"},
            "email": {"type": "string", "example": "john@example.com"},
            "role": {"type": "string", "enum": ["admin", "customer", "supplier", "active_supplier", "under_review", "member"], "example": "customer"},
            "phone_num": {"type": "string", "example": "+1234567890"},
            "company": {"type": "string", "example": "Acme Rentals"},
            "logo": {"type": "string", "example": "logo.png"},
            "country": {"type": "string", "example": "USA"},
            "language": {"type": "string", "example": "en"},
            "price_tax": {"type": "number", "example": 10},
            "integration": {"type": "boolean", "example": False},
            "webhook_url": {"type": "string", "example": "https://example.com/webhook"},
            "created_at": {"type": "string", "format": "date-time"}
        }
    },
    "UserListResponse": {
        "type": "object",
        "properties": {
            "status": {"type": "boolean", "example": True},
            "data": {"type": "array", "items": {"$ref": "#/components/schemas/User"}}
        }
    },
    "UserProfileResponse": {
        "type": "object",
        "properties": {
            "data": {
                "type": "object",
                "properties": {
                    "id": {"type": "integer"},
                    "name": {"type": "string"},
                    "email": {"type": "string"},
                    "role": {"type": "string"},
                    "rentals": {"type": "array", "items": {"$ref": "#/components/schemas/Rental"}}
                }
            }
        }
    },
    "ProfileResponse": {
        "type": "object",
        "properties": {
            "status": {"type": "boolean"},
            "data": {
                "type": "object",
                "properties": {
                    "id": {"type": "integer"},
                    "name": {"type": "string"},
                    "email": {"type": "string"},
                    "role": {"type": "string"},
                    "phone": {"type": "string"},
                    "company_name": {"type": "string"},
                    "integration": {"type": "boolean"},
                    "webhook_url": {"type": "string"},
                    "created_at": {"type": "string", "format": "date-time"}
                }
            }
        }
    },

    # ---- Integration ----
    "IntegrationSettingsRequest": {
        "type": "object",
        "required": ["integration"],
        "properties": {
            "integration": {"type": "boolean", "example": True},
            "webhook_url": {"type": "string", "nullable": True, "example": "https://your-system.com/webhook/autours"}
        }
    },
    "IntegrationSettingsResponse": {
        "type": "object",
        "properties": {
            "status": {"type": "boolean"},
            "message": {"type": "string"},
            "data": {
                "type": "object",
                "properties": {
                    "integration": {"type": "boolean"},
                    "webhook_url": {"type": "string", "nullable": True}
                }
            }
        }
    },

    # ---- Vehicle ----
    "Vehicle": {
        "type": "object",
        "properties": {
            "id": {"type": "integer", "example": 1},
            "name": {"type": "string", "example": "Toyota Camry 2024"},
            "description": {"type": "string", "example": "Comfortable sedan with automatic transmission"},
            "photo": {"type": "string", "example": "toyota_camry.jpg"},
            "price": {"type": "number", "example": 50.0},
            "week_price": {"type": "number", "example": 45.0},
            "month_price": {"type": "number", "example": 40.0},
            "activation": {"type": "boolean", "example": True},
            "instant_confirmation": {"type": "boolean", "example": True},
            "supplier": {"type": "integer", "example": 5},
            "pickup_loc": {"type": "integer", "example": 1},
            "category": {"type": "integer", "example": 2},
            "fuel_policy_id": {"type": "integer", "example": 1},
            "created_at": {"type": "string", "format": "date-time"},
            "updated_at": {"type": "string", "format": "date-time"}
        }
    },
    "VehicleListResponse": {
        "type": "object",
        "properties": {
            "status": {"type": "boolean"},
            "data": {"type": "array", "items": {"$ref": "#/components/schemas/Vehicle"}}
        }
    },
    "VehicleFilterResponse": {
        "type": "object",
        "properties": {
            "location": {"type": "string", "example": "London"},
            "location_id": {"type": "integer", "example": 1},
            "date_from": {"type": "string", "example": "2025-06-01"},
            "date_to": {"type": "string", "example": "2025-06-07"},
            "filteredVehicles": {"type": "array", "items": {"$ref": "#/components/schemas/Vehicle"}},
            "filteredCategories": {"type": "array", "items": {"$ref": "#/components/schemas/Category"}},
            "filteredSuppliers": {"type": "array", "items": {"$ref": "#/components/schemas/User"}},
            "filteredLocationTypes": {"type": "array", "items": {"$ref": "#/components/schemas/LocationType"}},
            "paymentMethods": {"type": "array", "items": {"$ref": "#/components/schemas/PaymentMethod"}},
            "count": {"type": "integer", "example": 42},
            "max": {"type": "number", "example": 500},
            "min": {"type": "number", "example": 30},
            "priceTax": {"type": "number", "example": 15},
            "daysNumber": {"type": "integer", "example": 6}
        }
    },
    "VehicleDetailResponse": {
        "type": "object",
        "properties": {
            "data": {
                "type": "object",
                "properties": {
                    "vehicle": {"$ref": "#/components/schemas/Vehicle"},
                    "date_from": {"type": "string", "example": "2025-06-01"},
                    "date_to": {"type": "string", "example": "2025-06-07"},
                    "time_from": {"type": "string", "example": "10:00:00"},
                    "time_to": {"type": "string", "example": "10:00:00"},
                    "days": {"type": "integer", "example": 6},
                    "currency": {"type": "string", "example": "USD"},
                    "location": {"type": "string", "example": "London"}
                }
            },
            "status": {"type": "boolean"}
        }
    },
    "VehicleEditResponse": {
        "type": "object",
        "properties": {
            "data": {"$ref": "#/components/schemas/Vehicle"},
            "status": {"type": "boolean"}
        }
    },
    "VehicleResponse": {
        "type": "object",
        "properties": {
            "status": {"type": "boolean"},
            "message": {"type": "string"},
            "data": {"$ref": "#/components/schemas/Vehicle"}
        }
    },
    "CreateVehicleRequest": {
        "type": "object",
        "required": ["name", "description", "price", "week_price", "month_price", "pickup_loc", "category"],
        "properties": {
            "photo": {"type": "string", "description": "Photo URL or file"},
            "car_photo": {"type": "string", "format": "binary", "description": "Photo file upload"},
            "name": {"type": "string", "example": "Toyota Camry"},
            "description": {"type": "string", "example": "Sedan with auto transmission"},
            "price": {"type": "number", "example": 50.0},
            "week_price": {"type": "number", "example": 45.0},
            "month_price": {"type": "number", "example": 40.0},
            "pickup_loc": {"type": "integer", "example": 1},
            "category": {"type": "integer", "example": 2},
            "fuel_policy_id": {"type": "integer", "example": 1},
            "instant_confirmation": {"type": "boolean", "example": True},
            "activation": {"type": "boolean", "example": True},
            "location_types": {"type": "array", "items": {"type": "integer"}, "example": [1, 2]},
            "included": {"type": "array", "items": {"type": "integer"}, "example": [1, 3, 5]},
            "specifications": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {"name": {"type": "string"}, "value": {"type": "string"}, "icon": {"type": "string"}}
                },
                "example": [{"name": "Transmission", "value": "Automatic", "icon": "fa-cog"}]
            }
        }
    },
    "CreateVehicleRequestJson": {
        "allOf": [{"$ref": "#/components/schemas/CreateVehicleRequest"}],
        "required": ["name", "description", "price", "week_price", "month_price", "pickup_loc", "category", "photo"]
    },
    "CreateEditVehicleRequest": {
        "type": "object",
        "properties": {
            "id": {"type": "integer", "description": "Required for update"},
            "update": {"type": "string", "enum": ["0", "1"], "description": "1 = update, 0 = create"},
            "photo": {"type": "string"},
            "name": {"type": "string"},
            "description": {"type": "string"},
            "price": {"type": "number"},
            "week_price": {"type": "number"},
            "month_price": {"type": "number"},
            "fuel_policy": {"type": "integer"},
            "instant_confirmation": {"type": "boolean"},
            "pickupLoc": {"type": "string"},
            "category": {"type": "integer"},
            "location_types": {"type": "integer"},
            "specifications": {"type": "string", "description": "JSON string of specifications array"},
            "included": {"type": "string", "description": "Comma-separated included IDs"}
        },
        "example": {"update": "0", "name": "Toyota Camry", "description": "Sedan", "price": 50, "week_price": 45, "month_price": 40, "pickupLoc": "1", "category": 2, "location_types": 1, "specifications": "[{\"name\":\"Transmission\",\"value\":\"Automatic\"}]", "included": "1,2,3"}
    },
    "UpdateVehiclePriceRequest": {
        "type": "object",
        "properties": {
            "price": {"type": "number", "example": 55.0},
            "week_price": {"type": "number", "example": 50.0},
            "month_price": {"type": "number", "example": 45.0}
        }
    },
    "UpdateVehiclePriceResponse": {
        "type": "object",
        "properties": {
            "status": {"type": "boolean"},
            "message": {"type": "string"},
            "data": {
                "type": "object",
                "properties": {
                    "id": {"type": "integer"},
                    "name": {"type": "string"},
                    "price": {"type": "number"},
                    "week_price": {"type": "number"},
                    "month_price": {"type": "number"}
                }
            }
        }
    },
    "FilterVehicleRequest": {
        "type": "object",
        "properties": {
            "pickupLoc": {"type": "string", "description": "Branch ID or location name", "example": "London"},
            "date_from": {"type": "string", "format": "date", "example": "2025-06-01"},
            "date_to": {"type": "string", "format": "date", "example": "2025-06-07"},
            "time_from": {"type": "string", "example": "10:00"},
            "time_to": {"type": "string", "example": "10:00"},
            "currency": {"type": "string", "example": "USD"},
            "priceRange": {"type": "number", "example": 200},
            "category": {"type": "array", "items": {"type": "integer"}, "example": [1, 2]},
            "supplier": {"type": "array", "items": {"type": "integer"}, "example": [5]},
            "location_type_id": {"type": "array", "items": {"type": "integer"}, "example": [1]},
            "payment_methods": {"type": "array", "items": {"type": "integer"}, "example": [2, 3]},
            "specifications": {"type": "array", "items": {"type": "object"}, "example": [{"name": "Transmission", "option": ["Automatic"]}]}
        }
    },
    "BulkUploadResponse": {
        "type": "object",
        "properties": {
            "status": {"type": "boolean"},
            "data": {
                "type": "object",
                "properties": {
                    "vehicles_imported": {"type": "integer"},
                    "vehicle_ids": {"type": "array", "items": {"type": "integer"}}
                }
            },
            "warnings": {"type": "array", "items": {"type": "string"}},
            "message": {"type": "string"}
        }
    },

    # ---- Branch ----
    "Branch": {
        "type": "object",
        "properties": {
            "id": {"type": "integer", "example": 1},
            "name": {"type": "string", "example": "Downtown Branch"},
            "location": {"type": "string", "example": "London"},
            "location_address": {"type": "string", "example": "123 Main St"},
            "adresse": {"type": "string", "example": "123 Main St"},
            "city": {"type": "string", "example": "London"},
            "country": {"type": "string", "example": "UK"},
            "phone": {"type": "string", "example": "+44 20 1234 5678"},
            "lat": {"type": "number", "example": 51.5074},
            "lng": {"type": "number", "example": -0.1278},
            "email": {"type": "string", "example": "branch@example.com"},
            "company_id": {"type": "integer", "example": 5},
            "currency": {"type": "string", "example": "GBP"},
            "location_type": {"type": "string", "example": "Airport"}
        }
    },
    "BranchListResponse": {
        "type": "object",
        "properties": {
            "status": {"type": "boolean"},
            "data": {"type": "array", "items": {"$ref": "#/components/schemas/Branch"}}
        }
    },
    "BranchResponse": {
        "type": "object",
        "properties": {
            "status": {"type": "boolean"},
            "data": {"$ref": "#/components/schemas/Branch"}
        }
    },
    "BranchRequest": {
        "type": "object",
        "required": ["name", "location", "country", "city", "currency"],
        "properties": {
            "name": {"type": "string"},
            "location": {"type": "string"},
            "adresse": {"type": "string"},
            "country": {"type": "string"},
            "pickup_type": {"type": "string"},
            "city": {"type": "string"},
            "phone": {"type": "string"},
            "lat": {"type": "number"},
            "lng": {"type": "number"},
            "email": {"type": "string", "format": "email"},
            "currency": {"type": "string"}
        }
    },

    # ---- Rental ----
    "Rental": {
        "type": "object",
        "properties": {
            "id": {"type": "integer", "example": 1},
            "order_number": {"type": "string", "example": "USATR0001"},
            "customer_id": {"type": "integer", "example": 10},
            "supplier_id": {"type": "integer", "example": 5},
            "vehicle_id": {"type": "integer", "example": 1},
            "price": {"type": "number", "example": 350.0},
            "supplier_price": {"type": "number", "example": 300.0},
            "profit_margin": {"type": "number", "example": 50.0},
            "start_date": {"type": "string", "format": "date", "example": "2025-06-01"},
            "end_date": {"type": "string", "format": "date", "example": "2025-06-07"},
            "start_time": {"type": "string", "example": "10:00:00"},
            "end_time": {"type": "string", "example": "10:00:00"},
            "currency": {"type": "string", "example": "USD"},
            "number_of_days": {"type": "integer", "example": 6},
            "order_status": {"type": "integer", "example": 1},
            "rate": {"type": "number", "example": 4.5},
            "old_rental_id": {"type": "integer", "example": None},
            "created_at": {"type": "string", "format": "date-time"}
        }
    },
    "RentalResponse": {
        "type": "object",
        "properties": {
            "status": {"type": "boolean"},
            "data": {"$ref": "#/components/schemas/Rental"}
        }
    },
    "RentalListWithStatusesResponse": {
        "type": "object",
        "properties": {
            "rentals": {"type": "array", "items": {"$ref": "#/components/schemas/Rental"}},
            "rental_statuses": {"type": "array", "items": {"$ref": "#/components/schemas/RentalStatus"}}
        }
    },
    "RentalWithRatesResponse": {
        "type": "object",
        "properties": {
            "status": {"type": "boolean"},
            "data": {
                "type": "object",
                "properties": {
                    "id": {"type": "integer"},
                    "rentalRates": {"type": "array", "items": {"type": "object"}}
                }
            }
        }
    },
    "SupplierInvoiceResponse": {
        "type": "object",
        "properties": {
            "data": {
                "type": "object",
                "properties": {
                    "total_price": {"type": "number", "example": 1500.0},
                    "currency": {"type": "string", "example": "USD"},
                    "count_rentals": {"type": "integer", "example": 10}
                }
            }
        }
    },

    # ---- RentalStatus ----
    "RentalStatus": {
        "type": "object",
        "properties": {
            "id": {"type": "integer"},
            "name": {"type": "string"},
            "created_at": {"type": "string", "format": "date-time"}
        }
    },

    # ---- Category ----
    "Category": {
        "type": "object",
        "properties": {
            "id": {"type": "integer", "example": 1},
            "name": {"type": "string", "example": "Sedan"},
            "photo": {"type": "string", "example": "sedan.png"}
        }
    },
    "CategoryListResponse": {
        "type": "object",
        "properties": {
            "status": {"type": "boolean"},
            "data": {"type": "array", "items": {"$ref": "#/components/schemas/Category"}}
        }
    },
    "CategoryRequest": {
        "type": "object",
        "required": ["name"],
        "properties": {
            "name": {"type": "string", "example": "SUV"},
            "photo": {"type": "string", "example": "suv.png"}
        }
    },
    "CategoryUpdateRequest": {
        "type": "object",
        "required": ["id"],
        "properties": {
            "id": {"type": "integer"},
            "name": {"type": "string"},
            "photo": {"type": "string"}
        }
    },

    # ---- Specification ----
    "Specification": {
        "type": "object",
        "properties": {
            "id": {"type": "integer", "example": 1},
            "name": {"type": "string", "example": "Transmission"},
            "icon": {"type": "string", "example": "fa-cog"},
            "options": {"type": "array", "items": {"type": "string"}, "example": ["Automatic", "Manual"]}
        }
    },
    "SpecificationListResponse": {
        "type": "object",
        "properties": {
            "status": {"type": "boolean"},
            "data": {"type": "array", "items": {"$ref": "#/components/schemas/Specification"}}
        }
    },
    "SpecificationRequest": {
        "type": "object",
        "required": ["name"],
        "properties": {
            "name": {"type": "string", "example": "Transmission"},
            "icon": {"type": "string", "example": "fa-cog"},
            "options": {"type": "array", "items": {"type": "string"}, "example": ["Automatic", "Manual"]}
        }
    },
    "SpecificationUpdateRequest": {
        "type": "object",
        "required": ["id"],
        "properties": {
            "id": {"type": "integer"},
            "name": {"type": "string"},
            "icon": {"type": "string"},
            "options": {"type": "array", "items": {"type": "string"}}
        }
    },

    # ---- Included ----
    "Included": {
        "type": "object",
        "properties": {
            "id": {"type": "integer", "example": 1},
            "what_is_included": {"type": "string", "example": "Free Cancellation"},
            "description": {"type": "string", "example": "Cancel for free up to 48h before pickup"}
        }
    },
    "IncludedListResponse": {
        "type": "object",
        "properties": {
            "status": {"type": "boolean"},
            "data": {"type": "array", "items": {"$ref": "#/components/schemas/Included"}}
        }
    },
    "IncludedRequest": {
        "type": "object",
        "required": ["what_is_included"],
        "properties": {
            "what_is_included": {"type": "string", "example": "Free GPS"},
            "description": {"type": "string", "example": "GPS navigation included"}
        }
    },

    # ---- FuelPolicy ----
    "FuelPolicy": {
        "type": "object",
        "properties": {
            "id": {"type": "integer", "example": 1},
            "name": {"type": "string", "example": "Full to Full"},
            "description": {"type": "string", "example": "Return with same fuel level"}
        }
    },
    "FuelPolicyListResponse": {
        "type": "object",
        "properties": {
            "status": {"type": "boolean"},
            "data": {"type": "array", "items": {"$ref": "#/components/schemas/FuelPolicy"}}
        }
    },

    # ---- LocationType ----
    "LocationType": {
        "type": "object",
        "properties": {
            "id": {"type": "integer", "example": 1},
            "name": {"type": "string", "example": "Airport"},
            "icon": {"type": "string", "example": "fa-plane"}
        }
    },
    "LocationTypeListResponse": {
        "type": "object",
        "properties": {
            "status": {"type": "boolean"},
            "data": {"type": "array", "items": {"$ref": "#/components/schemas/LocationType"}}
        }
    },

    # ---- RentalTerms ----
    "RentalTerms": {
        "type": "object",
        "properties": {
            "id": {"type": "integer", "example": 1},
            "title": {"type": "string", "example": "Minimum age 21"},
            "description": {"type": "string", "example": "Driver must be at least 21 years old"},
            "status": {"type": "string", "example": "approved"},
            "created_by": {"type": "integer"},
            "created_at": {"type": "string", "format": "date-time"}
        }
    },
    "RentalTermsListResponse": {
        "type": "object",
        "properties": {
            "status": {"type": "boolean"},
            "data": {"type": "array", "items": {"$ref": "#/components/schemas/RentalTerms"}}
        }
    },
    "RentalTermsRequest": {
        "type": "object",
        "required": ["title", "description"],
        "properties": {
            "title": {"type": "string", "example": "No smoking"},
            "description": {"type": "string", "example": "Smoking is not allowed in the vehicle"}
        }
    },
    "RentalTermsUpdateRequest": {
        "type": "object",
        "required": ["id"],
        "properties": {
            "id": {"type": "integer"},
            "title": {"type": "string"},
            "description": {"type": "string"}
        }
    },
    "RentalTermsStatusRequest": {
        "type": "object",
        "required": ["id", "status"],
        "properties": {
            "id": {"type": "integer"},
            "status": {"type": "string", "example": "approved"}
        }
    },

    # ---- PaymentMethod ----
    "PaymentMethod": {
        "type": "object",
        "properties": {
            "id": {"type": "integer", "example": 1},
            "name": {"type": "string", "example": "Credit Card"}
        }
    },
    "PaymentMethodListResponse": {
        "type": "object",
        "properties": {
            "status": {"type": "boolean"},
            "data": {"type": "array", "items": {"$ref": "#/components/schemas/PaymentMethod"}}
        }
    },

    # ---- Promo ----
    "Promo": {
        "type": "object",
        "properties": {
            "id": {"type": "integer"},
            "vehicle_id": {"type": "integer"},
            "included_id": {"type": "integer"},
            "created_at": {"type": "string", "format": "date-time"}
        }
    },
    "PromoListResponse": {
        "type": "object",
        "properties": {
            "status": {"type": "boolean"},
            "data": {"type": "array", "items": {"$ref": "#/components/schemas/Promo"}}
        }
    },

    # ---- RateQuestion ----
    "RateQuestion": {
        "type": "object",
        "properties": {
            "id": {"type": "integer", "example": 1},
            "objective": {"type": "string", "example": "Cleanliness"},
            "question": {"type": "string", "example": "How clean was the vehicle?"}
        }
    },
    "RateQuestionListResponse": {
        "type": "object",
        "properties": {
            "status": {"type": "boolean"},
            "data": {"type": "array", "items": {"$ref": "#/components/schemas/RateQuestion"}}
        }
    },

    # ---- Subscriber ----
    "Subscriber": {
        "type": "object",
        "properties": {
            "id": {"type": "integer", "example": 1},
            "email": {"type": "string", "example": "subscriber@example.com"},
            "country": {"type": "string", "example": "USA"},
            "created_at": {"type": "string", "format": "date-time"}
        }
    },
    "SubscriberListResponse": {
        "type": "object",
        "properties": {
            "status": {"type": "boolean"},
            "data": {"type": "array", "items": {"$ref": "#/components/schemas/Subscriber"}}
        }
    },

    # ---- BackgroundSetting ----
    "BackgroundSetting": {
        "type": "object",
        "properties": {
            "id": {"type": "integer", "example": 1},
            "section_key": {"type": "string", "example": "homepage_hero"},
            "section_name": {"type": "string", "example": "Homepage Hero"},
            "image_path": {"type": "string", "example": "bg/home.jpg"},
            "default_image_path": {"type": "string", "example": "bg/default_home.jpg"},
            "is_active": {"type": "boolean", "example": True}
        }
    },
    "BackgroundSettingListResponse": {
        "type": "object",
        "properties": {
            "status": {"type": "boolean"},
            "data": {"type": "array", "items": {"$ref": "#/components/schemas/BackgroundSetting"}}
        }
    },

    # ---- VehiclePhoto ----
    "VehiclePhoto": {
        "type": "object",
        "properties": {
            "id": {"type": "integer", "example": 1},
            "photo": {"type": "string", "example": "vehicle_123.jpg"},
            "name": {"type": "string", "example": "Toyota Camry"}
        }
    },
    "VehiclePhotoListResponse": {
        "type": "object",
        "properties": {
            "status": {"type": "boolean"},
            "data": {"type": "array", "items": {"$ref": "#/components/schemas/VehiclePhoto"}}
        }
    },

    # ---- Currency ----
    "Currency": {
        "type": "object",
        "properties": {
            "id": {"type": "integer", "example": 1},
            "name": {"type": "string", "example": "USD"},
            "symbol": {"type": "string", "example": "$"}
        }
    },
    "CurrencyListResponse": {
        "type": "object",
        "properties": {
            "status": {"type": "boolean"},
            "data": {"type": "array", "items": {"$ref": "#/components/schemas/Currency"}}
        }
    },

    # ---- Blog ----
    "Blog": {
        "type": "object",
        "properties": {
            "id": {"type": "integer", "example": 1},
            "blog_category_id": {"type": "integer", "example": 1},
            "title": {"type": "string", "example": "10 Tips for Renting a Car"},
            "slug": {"type": "string", "example": "10-tips-for-renting-a-car"},
            "author": {"type": "string", "example": "John Doe"},
            "image": {"type": "string", "example": "blog/renting_tips.jpg"},
            "image_alt_text": {"type": "string", "example": "Car rental tips"},
            "content": {"type": "string", "example": "<p>Renting a car can be easy...</p>"},
            "meta_description": {"type": "string", "example": "Learn the best tips for renting a car."},
            "is_published": {"type": "boolean", "example": True},
            "created_at": {"type": "string", "format": "date-time"}
        }
    },
    "BlogResponse": {
        "type": "object",
        "properties": {
            "success": {"type": "boolean"},
            "message": {"type": "string"},
            "data": {"$ref": "#/components/schemas/Blog"}
        }
    },
    "BlogPaginatedResponse": {
        "type": "object",
        "properties": {
            "success": {"type": "boolean"},
            "message": {"type": "string"},
            "data": {"$ref": "#/components/schemas/Pagination"}
        }
    },
    "BlogFormRequest": {
        "type": "object",
        "properties": {
            "blog_category_id": {"type": "integer"},
            "title": {"type": "string"},
            "slug": {"type": "string"},
            "author": {"type": "string"},
            "image": {"type": "string", "format": "binary"},
            "image_alt_text": {"type": "string"},
            "content": {"type": "string"},
            "meta_description": {"type": "string"},
            "is_published": {"type": "integer", "enum": [0, 1]}
        }
    },

    # ---- BlogCategory ----
    "BlogCategory": {
        "type": "object",
        "properties": {
            "id": {"type": "integer", "example": 1},
            "title": {"type": "string", "example": "Travel Tips"},
            "activation": {"type": "boolean", "example": True},
            "created_at": {"type": "string", "format": "date-time"}
        }
    },
    "BlogCategoryListResponse": {
        "type": "object",
        "properties": {
            "success": {"type": "boolean"},
            "data": {"type": "array", "items": {"$ref": "#/components/schemas/BlogCategory"}}
        }
    },
    "BlogCategoryResponse": {
        "type": "object",
        "properties": {
            "success": {"type": "boolean"},
            "data": {"$ref": "#/components/schemas/BlogCategory"}
        }
    },
    "BlogCategoryRequest": {
        "type": "object",
        "required": ["title"],
        "properties": {
            "title": {"type": "string", "example": "Travel Tips"},
            "activation": {"type": "boolean", "example": True}
        }
    },
    "BlogCategoryWithBlogsResponse": {
        "type": "object",
        "properties": {
            "success": {"type": "boolean"},
            "message": {"type": "string"},
            "category": {"$ref": "#/components/schemas/BlogCategory"},
            "data": {"$ref": "#/components/schemas/Pagination"}
        }
    },

    # ---- Profit ----
    "ProfitResponse": {
        "type": "object",
        "properties": {
            "status": {"type": "boolean"},
            "data": {"type": "object"}
        }
    },

    # ---- PriceTax ----
    "PriceTaxResponse": {
        "type": "object",
        "properties": {
            "priceTax": {"type": "number", "example": 10},
            "weekPriceTax": {"type": "number", "example": 8},
            "monthPriceTax": {"type": "number", "example": 5},
            "yearPriceTax": {"type": "number", "example": 3}
        }
    },

    # ---- Dashboard ----
    "DashboardResponse": {
        "type": "object",
        "properties": {
            "status": {"type": "boolean"},
            "data": {"type": "object"}
        }
    },
    "SupplierDashboardResponse": {
        "type": "object",
        "properties": {
            "status": {"type": "boolean"},
            "data": {"type": "object"}
        }
    },

    # ---- Pagination ----
    "Pagination": {
        "type": "object",
        "properties": {
            "current_page": {"type": "integer", "example": 1},
            "data": {"type": "array", "items": {"type": "object"}},
            "first_page_url": {"type": "string"},
            "from": {"type": "integer"},
            "last_page": {"type": "integer"},
            "last_page_url": {"type": "string"},
            "next_page_url": {"type": "string", "nullable": True},
            "path": {"type": "string"},
            "per_page": {"type": "integer"},
            "prev_page_url": {"type": "string", "nullable": True},
            "to": {"type": "integer"},
            "total": {"type": "integer"}
        }
    },
    "PaginatedVehicleResponse": {
        "type": "object",
        "properties": {
            "status": {"type": "boolean"},
            "data": {"$ref": "#/components/schemas/Pagination"}
        }
    },
    "PaginatedRentalResponse": {
        "type": "object",
        "properties": {
            "status": {"type": "boolean"},
            "data": {"$ref": "#/components/schemas/Pagination"}
        }
    }
}

os.makedirs("public/docs", exist_ok=True)
with open("public/docs/swagger.json", "w", encoding="utf-8") as f:
    json.dump(spec, f, indent=2, ensure_ascii=False)

print("swagger.json generated successfully")
