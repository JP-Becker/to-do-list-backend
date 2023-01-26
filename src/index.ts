import express, { Request, Response } from 'express'
import cors from 'cors'
import { db } from './database/knex'
import { TUserDB, TTasksDB, TUserTaskDB, TTasksWithUsersDB } from './types'

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


// USERS ENDPOINTS

// get all users
app.get('/users', async (req: Request, res: Response) => {
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
app.get('/users/search', async (req: Request, res: Response) => {
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
app.get('/users/:id', async (req: Request, res: Response) => {
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


// create a new user
app.post('/users', async (req: Request, res: Response) => {
    try {
        const { id, name, email, password } = req.body

        if (typeof id !== "string") {
            res.status(400)
            throw new Error("Tipo de 'id' inválido");
        }
        if (id.length < 4) {
            res.status(400)
            throw new Error("'id' deve possuir pelo menos 4 caracteres")
        }
        if (typeof name !== "string") {
            res.status(400)
            throw new Error("Tipo de 'name' inválido");
        }
        if (name.length < 4) {
            res.status(400)
            throw new Error("'name' deve possuir pelo menos 4 caracteres");
        }
        if (typeof email !== "string") {
            res.status(400)
            throw new Error("Tipo de 'email' inválido");
        }
        if (!password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,12}$/g)) {
			throw new Error("'password' deve possuir entre 8 e 12 caracteres, com letras maiúsculas e minúsculas e no mínimo um número e um caractere especial")
		}

        const [userIdAlreadyExists] : TUserDB[] | undefined[] = await db("users").where({id})

        if (userIdAlreadyExists) {
            res.status(400)
            throw new Error("Essa 'id' já existe");
        }

        const [userEmailAlreadyExists] : TUserDB[] | undefined[] = await db("users").where({email})

        if (userEmailAlreadyExists) {
            res.status(400)
            throw new Error("Esse 'email' já existe");
        }
        
        const newUser: TUserDB = {
            id,
            name,
            email,
            password
        }
        
        await db("users").insert(newUser)

        res.status(201).send({
            message: "User criado com sucesso",
            user: newUser
        })

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


// delete user by ID
app.delete('/users/:id', async (req: Request, res: Response) => {
    try {
        const idToDelete = req.params.id

        if (idToDelete[0] !== "f") {
            res.status(404)
            throw new Error("'id' deve iniciar com a letra 'f'")
        }

        const [userIdAlreadyExists] : TUserDB[] | undefined[] = await db("users").where({id: idToDelete})

        if (!userIdAlreadyExists) {
            res.status(404)
            throw new Error("Essa 'id' não existe")
        }

        await db("users").del().where({ id: idToDelete})
        res.status(200).send({ message: "User deletado com sucesso" })

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


// TASKS ENDPOINTS
// get all tasks
app.get('/tasks', async (req: Request, res: Response) => {
    try {
        const result = await db("tasks")
        res.status(200).send({ 'Lista de tarefas cadastradas': result})
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


// get task by id
app.get('/tasks/:id', async (req: Request, res: Response) => {
    try {
        const searchedId = req.params.id

        const [result] = await db("tasks").where({ id: searchedId })
        
        if (result) {
            res.status(200).send({"Resultado da sua busca" : result})
        } else {
            res.status(404)
            throw new Error("A 'id' da tarefa buscada não existe no banco de dados");
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