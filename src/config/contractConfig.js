const dotenv = require("dotenv");
dotenv.config();
const  contractAddress = process.env.NEXT_PUBLIC_REGISTRATION_CONTRACT_ADDRESS;
const matrixProABI  = require("../../ABI/MatrixPro.json");
const bookingContractAddress  = process.env.NEXT_PUBLIC_MATRIX_CONTRACT_ADDRESS;
const registrationContractABI = require("../../ABI/registration.json");
const tokenContractAddress= process.env.TOKEN_CONTRACT_ADDRESS
const tokenABI = require("../../ABI/token.json")

module.exports = {
    contractAddress,
    registrationContractABI,
    matrixProABI,
    bookingContractAddress,
    tokenABI,
    tokenContractAddress
}