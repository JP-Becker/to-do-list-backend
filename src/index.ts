import express, { Request, Response } from 'express'
import cors from 'cors'
import { db } from './database/knex'

const app = express()

app.use(cors())
app.use(express.json())

app.listen(3003, () => {
    console.log(`Servidor rodando na porta ${3003}`)
})

app.get("/ping", async (req: Request, res: Response) => {
    try {
				const result = await db("users")
        res.status(200).send({ message: "Pong!", result })
    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
});


// get all users
app.get('/users', async (req, res) => {
    try {
        const result = await db("users")
        res.status(200).send({ 'Lista de usuários cadastrados': result})
    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})


// search user by name via query params
app.get('/users/search', async (req, res) => {
    try {
        const q = req.query.q as string

        if (q.length > 0) {
            const searchedProduct = await db("users").where("name", "LIKE", `%${q}%`)
            res.status(200).send({"Resultado(s) da sua busca": searchedProduct})
        } else {
            res.status(400)
            throw new Error("Você deve digitar algo no campo de busca!");
        }

    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})


// search user by ID via path params
app.get('/users/:id', async (req, res) => {
    try {
        const searchedId = req.params.id

        const [result] = await db("users").where({ id: searchedId })
        
        if (result) {
            res.status(200).send({"Resultado da sua busca" : result})
        } else {
            res.status(404)
            throw new Error("A 'id' buscada não existe no banco de dados");
        }

    } catch (error) {
        console.log(error)

        if (req.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})
