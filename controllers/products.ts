import { Client } from "https://deno.land/x/postgres/mod.ts";
import { dbCreds } from "../config.ts";

// init client

const client = new Client(dbCreds)

// @desc get all products
// @route GET /api/v1/products
const getProducts = async ({ response } : { response: any }) => {
    try {
        await client.connect()

        const result = await client.query("SELECT * FROM products")
        
        const products = new Array()

        result.rows.map(p => {
            let obj: any = new Object()

            result.rowDescription.columns.map((el, i) => {
                obj[el.name] = p[i]
            })

            products.push(obj)
        })
        response.body = {
            succes: true,
            data: products
        }
    } catch (error) {
        response.status = 500
        response.body = {
            succes: false,
            msg: error.toString()
        }
    } finally {
        await client.end()
    }
}

// @desc get single product
// @route GET /api/v1/products/:id
const getProduct = async ({ params, response } : { params: { id: string }, response: any }) => {
    try {
        await client.connect()

        const result = await client.query("SELECT * FROM products WHERE ID = $1", params.id)

        if (result.rows.toString() === "") {
            response.status = 404
            response.body = {
                succes: false,
                msg: `No product with the id of ${params.id}`
            }
            return;
        } else {
            const product: any = new Object()

            result.rows.map(p => {
                result.rowDescription.columns.map((el, i) => {
                    product[el.name] = p[i]
                })
            })
            
            response.body = {
                succes: true,
                data: product
            }
        }
    } catch (error) {
        response.status = 500
        response.body = {
            succes: false,
            msg: error.toString()
        }
    } finally {
        await client.end()
    }
}

// @desc add product
// @route POST /api/v1/products
const addProduct = async ({ request, response } : { request: any, response: any }) => {
    const body = await request.body()
    const product = body.value

    if (!request.hasBody) {
        response.status = 400
        response.body = {
            succes: false,
            msg: "No data"
        }
    } else {
        try {
            await client.connect()

            const result = await client.query("INSERT INTO products(name, description, price) VALUES($1, $2, $3)", product.name, product.description, product.price)

            response.status = 201
            response.body = {
                succes: true,
                data: product
            }
        } catch (error) {
            response.status = 500
            response.body = {
                succes: false,
                msg: error.toString()
            }
        } finally {
            await client.end()
        }
    }
}

// @desc update a product
// @route PUT /api/v1/products/:id
const updateProduct = async ({ params, request, response } : { params: { id: string }, request: any, response: any }) => {
    await getProduct({ params: {"id": params.id}, response })

    if (response.status === 404) {
        response.body = {
            succes: false,
            msg: response.body.msg
        }
        response.status = 404
    } else {
        const body = await request.body()
        const product = body.value

        if (!request.hasBody) {
            response.status = 400
            response.body = {
                succes: false,
                msg: "No data"
            }
        } else {
            try {
                await client.connect()
    
                const result = await client.query("UPDATE products SET name = $1, description = $2, price = $3 WHERE id = $4", product.name, product.description, product.price, params.id)
    
                response.status = 200
                response.body = {
                    succes: true,
                    data: product
                }
            } catch (error) {
                response.status = 500
                response.body = {
                    succes: false,
                    msg: error.toString()
                }
            } finally {
                await client.end()
            }
        }
    }
}

// @desc delete  product
// @route DELETE /api/v1/products/:id
const deleteProduct = async ({ params, response } : { params: { id: string }, response: any }) => {
    await getProduct({ params: {"id": params.id}, response })

    if (response.status === 404) {
        response.body = {
            succes: false,
            msg: response.body.msg
        }
        response.status = 404
    } else {
        try {
            await client.connect()

            const result = await client.query("DELETE FROM products WHERE id = $1", params.id)

            response.body = {
                succes: true,
                msg: `Product with id ${params.id} has been deleted`
            }
            response.status = 204
        } catch (error) {
            response.status = 500
            response.body = {
                succes: false,
                msg: error.toString()
            }
        } finally {
            await client.end()
        }
    }
}

export { getProducts, getProduct, addProduct, updateProduct, deleteProduct }