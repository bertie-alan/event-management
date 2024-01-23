import supertest from "supertest";
import App from "../app";
import prisma from "../prisma";


const app = new App().app;

describe("Test REGISTER New Account", () => {
    
    beforeEach(() => {

    })

    beforeAll(async () => {
        await prisma.$connect();
    })


    afterEach(() => {

    })

    afterAll(async () => {
        // delete data testing
        await prisma.user.delete({
            where: { username: "accacia" }
        });

        await prisma.$disconnect();
    })

    //GOOD CASE
    it("POST : register new user (email not exist in database)", async () => {
        const registerResponse = await supertest(app).post("/auth/register").send({
            username: "accacia",
            email : "accacia.mail@yopmail.com",
            password : "accacia123",
            gender : "FEMALE",
            role : "ADMIN"
        })

        expect(registerResponse.status).toBe(201);
        expect(registerResponse.body.success).toBe(true);
    });


    //BAD CASE
    it("POST : register new user (email already exist in database)", async () => {
        const registerResponse = await supertest(app).post("/auth/register").send({
            username: "jasper",
            email : "accacia.mail@yopmail.com",
            password : "jasper123",
            gender : "MALE",
            role : "USER"
        })

        expect(registerResponse.status).toBe(400);
    });


})

