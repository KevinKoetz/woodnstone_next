import { Schema, model } from 'mongoose'
import { Product } from '../../../types'



const isInteger = (number: number) => {
    return number === Math.floor(number)
}

const schema = new Schema<Product>({
    name: { type: String, required: true, unique: true, },
    description: { type: String, required: true },
    startingPrice: { type: Number, required: true, min: 0, validate: isInteger }, //Prices to be stored in euro-cents (no comma values)
    stock: { type: Number, required: true, min: 0, validate: isInteger },
    maxOrderAmount: { type: Number, required: true, min: 1, validate: isInteger },
    images: { type: [String], required: true, minlength: 1 }

});

export default model('Product', schema)


