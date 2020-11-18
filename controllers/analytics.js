const moment = require('moment');
const Order = require('../models/Order');
const errorHandler = require('../utils/errorHandler');

module.exports.overview = async (req, res) => {
    try {
        const allOrders = await Order.find({ user: req.user.id }).sort({ date: 1 });
        const ordersMap = getOrdersMap(allOrders);
        const yesterdayOrders = ordersMap[moment().add(-1, 'd').format('DD.MM.YYYY')] || [];

        // COUNT ORDERS AT YESTERDAY
        const countYesterdayOrders = yesterdayOrders.length;
        // COUNT TOTAL ORDERS
        const totalOrdersNumber = allOrders.length;
        // COUNT TOTAL DAY
        const daysNumber = Object.keys(ordersMap).length;
        // COUNT ORDERS A DAY
        const ordersPerDay = (totalOrdersNumber / daysNumber).toFixed(0);
        // PERCENT FOR COUNT ORDERS
        const percentADay = (( (countYesterdayOrders / ordersPerDay) - 1 ) * 100).toFixed(2);
        // COMMON SUMMARY
        const totalGain = calculatePrice(allOrders);
        // SUMMARY PER DAY
        const gainPerDay = totalGain / daysNumber;
        // SUMMARY PER YESTERDAY
        const gainPerYesterday = calculatePrice(yesterdayOrders);
        // PERCENT SUMMARY
        const gainPercent = (( (gainPerYesterday / gainPerDay) - 1 ) * 100).toFixed(2);
        // EQUAL SUMMARY
        const compareGain = (gainPerYesterday - gainPerDay).toFixed(2);
        // EQUAL ORDERS
        const compareOrders = (countYesterdayOrders - ordersPerDay).toFixed(2);

        res.status(200).json({
            gain: {
                percent: Math.abs(+gainPercent),
                compare: Math.abs(+compareGain),
                yesterday: +gainPerYesterday,
                isHigher: +gainPercent > 0
            },
            orders: {
                percent: Math.abs(+percentADay),
                compare: Math.abs(+compareOrders),
                yesterday: +countYesterdayOrders,
                isHigher: +percentADay > 0
            }
        });
    } catch (err) {
        errorHandler(res, err);
    }
};

module.exports.analytics = async (req, res) => {
    try {
        const allOrders = await Order.find({ user: req.user.id }).sort({ date: 1 });
        const ordersMap = getOrdersMap(allOrders);

        const average = +(calculatePrice(allOrders) / Object.keys(ordersMap).length).toFixed(2);

        const chart = Object.keys(ordersMap).map(label => {
            const gain = calculatePrice(ordersMap[label]);
            const order = ordersMap[label].length;

            return {
                label,
                order,
                gain
            }
        });

        res.status(200).json({
            average,
            chart
        })
    } catch (err) {
        errorHandler(res, err);
    }
};

function getOrdersMap(orders = []) {
    const daysOrders = {};
    orders.forEach(order => {
        const day = moment(order.date).format('DD.MM.YYYY');
        if ( day === moment().format('DD.MM.YYYY') ) return;
        if ( !daysOrders[day] ) {
            daysOrders[day] = [];
        }
        daysOrders[day].push(order);
    });
    return daysOrders;
};

function calculatePrice(orders = []) {
    return orders.reduce(( total, order ) => {
        const orderPrice = order.list.reduce(( orderTotal, item ) => {
            return orderTotal += item.cost * item.quantity;
        }, 0);
        return total += orderPrice;
    }, 0);
}