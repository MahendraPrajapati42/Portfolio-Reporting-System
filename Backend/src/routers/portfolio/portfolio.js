const express = require('express')
const chance = require('chance').Chance()

const User = require('../../models/user')
const Stock = require('../../models/stocks')
const Mystock = require('../../models/mystocks')
const History = require('../../models/history')

const auth = require('../../middleware/auth')

const router = new express.Router()

router.post('/createStocks', async(req,res)=>{

    let name = req.body.name
    let stockType = req.body.stockType
    let relPrice = req.body.relPrice
    let flux = req.body.flux

    try {
        let prices = await Array.from(Array(366)).map(x => chance.floating({min: relPrice-chance.floating({min:0, max:flux}), max: relPrice+chance.floating({min:0,max:flux})}))

        let stock = new Stock({
            name,
            stockType,
            prices
        })
        await stock.save()

        res.send({
            stock,
            openingPrices: prices.splice(0,365),
            closingPrices: prices.splice(1,366)
        })

    } catch (e) {
        res.send(e)
    }

})

router.get('/showStocks', async(req,res)=>{

    try {
        let stocks = await Stock.find({})
        res.send(stocks)
    } catch (e) {
        res.send(e)
    }
})


// router.post('/addstock', auth,async(req, res) => {

//     let name = req.body.name
//     let quantity=req.body.quantity
//     let buyPrice = req.body.buyPrice
//     // let stockType = req.body.stockType
//     console.log('name quant buypr---->', name, quantity, buyPrice, stockType);
    
//     let mystock = await Mystock.findOne({name, owner:req.user._id})
//     console.log('Mystock before if----->', mystock);
//     if(!mystock){

//         let priceArray = await Array.from(Array(9)).map(x => chance.floating({min: buyPrice-chance.floating({min:0, max:3}), max: buyPrice+chance.floating({min:0,max:3})}))
//         console.log('Price array------>', priceArray);
//         let irrelevant = priceArray.splice(chance.integer({min:2,max:8}),0,buyPrice)
//         console.log('New Price array------>', priceArray);

//         mystock = new Mystock({
//             name,
//             stockType,
//             owner: req.user._id,
//             quantity,
//             buyPrice,
//             totalInvestment: buyPrice*quantity,
//             totalReturns: (priceArray[priceArray.length-1]*quantity - (buyPrice*quantity)).toFixed(4),
//             prices:{
//                 price: priceArray,
//                 oneDayChange: ((priceArray[priceArray.length-1] - priceArray[0])*100/priceArray[0]).toFixed(4),
//                 roi: ((priceArray[priceArray.length-1] - buyPrice)*100/buyPrice).toFixed(4),
//                 currentValue: (((priceArray[priceArray.length-1] - buyPrice)*100/buyPrice)*(buyPrice*quantity)/100).toFixed(4)
//             }
//         })
//         console.log('Mystock----->yayaya', mystock);
//         console.log('Mystock----->yayaya11111', mystock);
//         await mystock.save()
//         console.log('MyStock saved----------->');

//         let history = new History({
//             name,
//             stockType,
//             stockId: mystock.stockId,
//             trade: 'buy',
//             tradeId: mystock.tradeId,
//             owner:req.user._id,
//             quantity,
//             pricePerUnit: buyPrice,
//             totalPrice: (buyPrice*quantity).toFixed(4)
//         })
//         await history.save()
//         console.log('History saved');

//         return res.send({mystock, openingPrice:priceArray[0],closingPrice:priceArray[priceArray.length-1], oneDayReturn:`${mystock.oneDayChange}%`, roi:`${mystock.prices.roi}%`})
    
//     }
//     else{
//         // let mystock = await Mystock.findOne({name,owner:req.user._id})
//         let updatemystock = await Mystock.findOneAndUpdate({
//             name,owner:req.user._id
//         },
//         {
//             quantity: mystock.quantity+quantity,
//             totalInvestment: (mystock.totalInvestment + (buyPrice*quantity)).toFixed(4),
//             buyPrice: ((mystock.totalInvestment + (buyPrice*quantity))/(mystock.quantity+quantity)).toFixed(4)
//             // totalReturns: priceArray[priceArray.length-1]*(mystock.quantity+quantity) - (mystock.totalInvestment + (buyPrice*quantity))
//         })
//         console.log('Updated quantity, total investment and buy price------------->');


//         // let mystock1 = await Mystock.findOne({name,owner:req.user._id})
//         // console.log('Mystock-------------->', mystock1);
//         let priceArray = await Array.from(Array(8)).map(x => chance.floating({min: buyPrice-chance.floating({min:0, max:3}), max: buyPrice+chance.floating({min:0,max:3})}))
//         console.log('Price array------>', priceArray);
//         let irr = priceArray.unshift(mystock.prices[mystock.prices.length-1].price[mystock.prices[mystock.prices.length-1].price.length-1])
//         let irrelevant = priceArray.splice(chance.integer({min:2,max:8}),0,buyPrice)
//         console.log('New Price array------>', priceArray);

//         mystock.totalReturns = (priceArray[priceArray.length-1]*(mystock.quantity+quantity) - (mystock.totalInvestment + (buyPrice*quantity))).toFixed(4)
//         await mystock.save()
//         console.log('total returns updated');
//         console.log('total');
//         mystock.prices = mystock.prices.concat({
//             day: mystock.prices[mystock.prices.length-1].day + 1,
//             price: priceArray,
//             oneDayChange: ((priceArray[priceArray.length-1] - priceArray[0])*100/priceArray[0]).toFixed(4),
//             roi: ((priceArray[priceArray.length-1] - (mystock.totalInvestment/mystock.quantity))*100/(mystock.totalInvestment/mystock.quantity)).toFixed(4),
//             currentValue: (mystock.totalInvestment + (((priceArray[priceArray.length-1] - (mystock.totalInvestment/mystock.quantity))*100/(mystock.totalInvestment/mystock.quantity))*mystock.totalInvestment)/100).toFixed(4)
//         })
//         await mystock.save()
//         console.log('day and prices updated-------');

//         let history = new History({
//             name,
//             stockType,
//             stockId: mystock.stockId,
//             trade: 'buy',
//             tradeId: mystock.tradeId,
//             owner:req.user._id,
//             quantity,
//             pricePerUnit: buyPrice,
//             totalPrice: (buyPrice*quantity).toFixed(4)
//         })
//         await history.save()
//         console.log('History saved');

//         return res.send({
//             mystock: mystock,
//             openingPrice: priceArray[0],
//             closingPrice: priceArray[priceArray.length-1]
//         })
//     }
    

// })


















router.post('/addstock', auth,async(req, res) => {

    let name = req.body.name
    let quantity=req.body.quantity
    let buyPrice = req.body.buyPrice
    let stockType = req.body.stockType
    console.log('name quant buypr---->', name, quantity, buyPrice, stockType);
    
    let mystock = await Mystock.findOne({name, owner:req.user._id})
    console.log('Mystock before if----->', mystock);
    if(!mystock){

        let priceArray = await Array.from(Array(9)).map(x => chance.floating({min: buyPrice-chance.floating({min:0, max:3}), max: buyPrice+chance.floating({min:0,max:3})}))
        console.log('Price array------>', priceArray);
        let irrelevant = priceArray.splice(chance.integer({min:2,max:8}),0,buyPrice)
        console.log('New Price array------>', priceArray);

        mystock = new Mystock({
            name,
            stockType,
            owner: req.user._id,
            quantity,
            buyPrice,
            totalInvestment: buyPrice*quantity,
            totalReturns: (priceArray[priceArray.length-1]*quantity - (buyPrice*quantity)).toFixed(4),
            prices:{
                price: priceArray,
                oneDayChange: ((priceArray[priceArray.length-1] - priceArray[0])*100/priceArray[0]).toFixed(4),
                roi: ((priceArray[priceArray.length-1] - buyPrice)*100/buyPrice).toFixed(4),
                currentValue: (((priceArray[priceArray.length-1] - buyPrice)*100/buyPrice)*(buyPrice*quantity)/100).toFixed(4)
            }
        })
        console.log('Mystock----->yayaya', mystock);
        console.log('Mystock----->yayaya11111', mystock);
        await mystock.save()
        console.log('MyStock saved----------->');

        let history = new History({
            name,
            stockType,
            stockId: mystock.stockId,
            trade: 'buy',
            tradeId: mystock.tradeId,
            owner:req.user._id,
            quantity,
            pricePerUnit: buyPrice,
            totalPrice: (buyPrice*quantity).toFixed(4)
        })
        await history.save()
        console.log('History saved');

        return res.send({mystock, openingPrice:priceArray[0],closingPrice:priceArray[priceArray.length-1], oneDayReturn:`${mystock.oneDayChange}%`, roi:`${mystock.prices.roi}%`})
    
    }
    else{
        // let mystock = await Mystock.findOne({name,owner:req.user._id})
        let updatemystock = await Mystock.findOneAndUpdate({
            name,owner:req.user._id
        },
        {
            quantity: mystock.quantity+quantity,
            totalInvestment: (mystock.totalInvestment + (buyPrice*quantity)).toFixed(4),
            buyPrice: ((mystock.totalInvestment + (buyPrice*quantity))/(mystock.quantity+quantity)).toFixed(4)
            // totalReturns: priceArray[priceArray.length-1]*(mystock.quantity+quantity) - (mystock.totalInvestment + (buyPrice*quantity))
        })
        console.log('Updated quantity, total investment and buy price------------->');


        // let mystock1 = await Mystock.findOne({name,owner:req.user._id})
        // console.log('Mystock-------------->', mystock1);
        let priceArray = await Array.from(Array(8)).map(x => chance.floating({min: buyPrice-chance.floating({min:0, max:3}), max: buyPrice+chance.floating({min:0,max:3})}))
        console.log('Price array------>', priceArray);
        let irr = priceArray.unshift(mystock.prices[mystock.prices.length-1].price[mystock.prices[mystock.prices.length-1].price.length-1])
        let irrelevant = priceArray.splice(chance.integer({min:2,max:8}),0,buyPrice)
        console.log('New Price array------>', priceArray);

        mystock.totalReturns = (priceArray[priceArray.length-1]*(mystock.quantity+quantity) - (mystock.totalInvestment + (buyPrice*quantity))).toFixed(4)
        await mystock.save()
        console.log('total returns updated');
        console.log('total');
        mystock.prices = mystock.prices.concat({
            day: mystock.prices[mystock.prices.length-1].day + 1,
            price: priceArray,
            oneDayChange: ((priceArray[priceArray.length-1] - priceArray[0])*100/priceArray[0]).toFixed(4),
            roi: ((priceArray[priceArray.length-1] - (mystock.totalInvestment/mystock.quantity))*100/(mystock.totalInvestment/mystock.quantity)).toFixed(4),
            currentValue: (mystock.totalInvestment + (((priceArray[priceArray.length-1] - (mystock.totalInvestment/mystock.quantity))*100/(mystock.totalInvestment/mystock.quantity))*mystock.totalInvestment)/100).toFixed(4)
        })
        await mystock.save()
        console.log('day and prices updated-------');

        let history = new History({
            name,
            stockType,
            stockId: mystock.stockId,
            trade: 'buy',
            tradeId: mystock.tradeId,
            owner:req.user._id,
            quantity,
            pricePerUnit: buyPrice,
            totalPrice: (buyPrice*quantity).toFixed(4)
        })
        await history.save()
        console.log('History saved');

        return res.send({
            mystock: mystock,
            openingPrice: priceArray[0],
            closingPrice: priceArray[priceArray.length-1]
        })
    }
    

})

router.patch('/updateprice', auth, async(req, res)=>{

    let name = req.body.name
    console.log('Params---------->', name)
    let mystock = await Mystock.findOne({owner: req.user._id, name})
    console.log('Mystock--------------->', mystock);
    let lastDayPrices = mystock.prices[mystock.prices.length-1]
    console.log('Last day prices------->', lastDayPrices);
    let newOpeningPrice = lastDayPrices.price[lastDayPrices.price.length-1]
    console.log('New opening price----->', newOpeningPrice);
    let priceArray = await Array.from(Array(9)).map(x => chance.floating({min: newOpeningPrice-chance.floating({min:0, max:2}), max: newOpeningPrice+chance.floating({min:0,max:3})}))
    console.log('Price array----->', priceArray);
    let newLength = priceArray.unshift(newOpeningPrice)
    console.log('New Price array------>', priceArray);
    mystock.prices =  mystock.prices.concat({
        day: lastDayPrices.id + 1,
        price: priceArray,
        oneDayChange: ((priceArray[priceArray.length-1] - priceArray[0])*100/priceArray[0]).toFixed(4),
        roi: ((priceArray[priceArray.length-1] - mystock.buyPrice)*100/mystock.buyPrice).toFixed(4),
        currentValue: ((roi*mystock.totalInvestment)/100).toFixed(4)
    })
    console.log('Updated mystock----->', mystock);
    await mystock.save()
    console.log('mystock saved------->');

    res.send({mystock, openingPrice: priceArray[0],closingPrice:priceArray[priceArray.length-1], eodReturn:`${(priceArray[priceArray.length-1]-mystock.buyPrice)*100/mystock.buyPrice}%`})
})

router.post('/sellstock', auth,async(req, res) => {

    let name = req.body.name
    let quantity=req.body.quantity
    let sellPrice = req.body.sellPrice
    let stockType = req.body.stockType


    let priceArray = await Array.from(Array(8)).map(x => chance.floating({min: buyPrice-chance.floating({min:0, max:3}), max: buyPrice+chance.floating({min:0,max:3})}))
    console.log('Price array------>', priceArray);
    let irr = priceArray.unshift(mystock.prices[mystock.prices.length-1].price[mystock.prices[mystock.prices.length-1].price.length-1])
    let irrelevant = priceArray.splice(chance.integer({min:2,max:8}),0,sellPrice)
    console.log('New Price array------>', priceArray);


    let mystock = await Mystock.findOne({name, owner: req.user._id})
    mystock.quantity = mystock.quantity - quantity
    mystock.totalInvestment = (mystock.totalInvestment - (sellPrice*quantity)).toFixed(4)
    mystock.buyPrice = (mystock.totalInvestment/mystock.quantity).toFixed(4)
    mystock.totalReturns = (mystock.quantity*priceArray[priceArray.length-1]).toFixed(4)
    
    await mystock.save()

    mystock.prices = mystock.prices.concat({
        day: mystock.prices[mystock.prices.length-1].day + 1,
        price: priceArray,
        oneDayChange: ((priceArray[priceArray.length-1] - priceArray[0])*100/priceArray[0]).toFixed(4),
        roi: ((priceArray[priceArray.length-1] - mystock.buyPrice)*100/mystock.buyPrice).toFixed(4),
        currentValue: ((roi*mystock.totalInvestment)/100).toFixed(4)
    })

    let history = new History({
        name,
        stockType,
        stockId: mystock.stockId,
        trade: 'sell',
        tradeId: mystock.tradeId,
        owner: req.user._id,
        quantity,
        pricePerUnit: sellPrice,
        totalPrice: (sellPrice*quantity).toFixed(4)
    })

    await history.save()
    await mystock.save()

    if(mystock.quantity===0){
        let deletedOne = await Mystock.deleteOne({name, owner:req.user._id})
    }

    res.send({
        mystock
    })




})
// router.post('/createexchange', async(req, res)=>{
    
//     console.log('in create exchange api');
//     const stock = new Stock(req.body)
//     console.log('stock json ---------->', stock);
//     try {
//         await stock.save()
//         res.send(stock)
//     } catch (e) {
//         res.send(e)
//     }
// })


// router.post('/investmentoptions', async(req, res) => {


//     try {
//         res.send({msg:'Investment options shown here'})
//     } catch (e) {
//         res.send(e)
//     }
// })



router.post('/dashboard', auth,async(req, res) => {

    try {
        let mystocks = await Mystock.find({})
        if(mystocks.length===0){
            return res.send({msg:'No Investments yet.'})
        }
        res.send(mystocks)
    } catch (e) {
        res.send(e)
    }
})

// router.get('/user/exchange', async(req, res) => {

//     try {
//         const exchange = await Stock.find({})
//         res.send(exchange)
//     } catch (e) {
//         res.send(e)
//     }
// })

// router.post('/user/txn', async(req, res) => {

//     let name = req.body.name
//     let quantity = req.body.quantity
//     let txn = req.body.txn

//     console.log('Params----->', name, quantity, txn);

//     let stock = await Stock.findOne({name})
//     console.log('stock is-------', stock);

//     let mystock = await Mystock.findOne({name}) 
//     console.log('init mystock------------>');

//     try {
//         if(txn==='buy'){
//             if(!mystock){

//                 let newQuant = stock.quantity - quantity
//                 console.log('New quant----->', newQuant);
//                 // stock.quantity = stock.quantity - quant
//                 let updateExchange = await Stock.findOneAndUpdate({name}, {quantity: newQuant}, {useFindAndModify: false})
//                 console.log('name , id, quant----->', name, stock.id, quantity);
//                 let mystock1 = new Mystock({
//                     name,
//                     id: stock.id,
//                     quantity
//                 })
//                 console.log('my stock is-------', mystock1);
//                 // await stock.save()
//                 await mystock1.save()
//                 return res.send({
//                     updatedStock: stock,
//                     myStock: mystock1
//                 })
//             }
//             else{
//                 let newQuant = stock.quantity - quantity
//                 let mystockQuant = mystock.quantity + quantity
//                 console.log('New quant----->', newQuant);
//                 let updateExchange = await Stock.findOneAndUpdate({name}, {quantity: newQuant}, {useFindAndModify: false})
//                 let updateMystock = await Mystock.findOneAndUpdate({name}, {quantity: mystockQuant}, {useFindAndModify: false})
//                 // await mystock.save()
//                 // await stock.save()

//                 return res.send({
//                     stock,
//                     mystock
//                 })
//             }
//         }

//         else{

//             let stockQuant = stock.quantity + quantity
//             let mystockQuant = mystock.quantity - quantity
//             let updatedStock = await Stock.findOneAndUpdate({name}, {quantity: stockQuant}, {useFindAndModify: false})
//             if(mystockQuant === 0){
//                 await Mystock.deleteOne({name})
//             }else{
//                 let updateMystock = await Mystock.findOneAndUpdate({name}, {quantity: mystockQuant}, {useFindAndModify: false})
//             }

//             return res.send({
//                 updatedStock: stock,
//                 mystock
//             })
//         }














//     //     console.log('in txn try catch---------->');
//     //     console.log('Params----->', name, quantity, txn);
        
//     //     // let updateExchange = await Stock.findOneAndUpdate({name}, {quantity: quantity-quant}) 
//     //     if(txn == "buy"){

//     //         console.log('in if----->');
            
//     //     }else{

//     //         let newQuant = stock.quantity + quantity
//     //         console.log('New quant----->', newQuant);
//     //         let updateExchange = await Stock.findOneAndUpdate({name}, {quantity: newQuant})
//     //         console.log('after sell stock quantity', stock.quantity);
//     //     }
//     //     await stock.save()
//     //     console.log('Stock saved---------->');

//     //     res.send({
//     //         updatedStock: stock,
//     //         myStock: mystock
//     //     })
//     } catch (e) {
//         res.send({e})
//     }
// })




module.exports = router