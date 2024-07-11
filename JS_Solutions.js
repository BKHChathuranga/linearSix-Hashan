//----------------------------q1 -----------------------------------------------
Date.prototype.daysTo = function (date) {
  const differenceBetweenDates = date - this;

  const convertMilliToDays = 1000 * 60 * 60 * 24;
  const differenceOfDays = differenceBetweenDates / convertMilliToDays;

  return Math.floor(Math.abs(differenceOfDays));
};

const day1 = new Date("2024-07-01");
const day2 = new Date("2024-07-05");

console.log(day1.daysTo(day2));

//--------------------------q2--------------------------------------------
const sales = [
  { amount: 10000, quantity: 10 },
  { amount: 20000, quantity: 5 },
  { amount: 15000, quantity: 7 },
];

const orderByTotal = (sales) => {
  const newSalesArrayWithTotal = sales.map((saleItem) => ({
    ...saleItem,
    total: saleItem.amount * saleItem.quantity,
  }));

  //assuming highest total comes first
  return newSalesArrayWithTotal.sort((a, b) => b.total - a.total);
};

console.log(orderByTotal(sales));

//------------------------------q3 --------------------------------------

const objectProjection = (src, proto) => {
  const result = {};

  for (const key in proto) {
    if (proto.hasOwnProperty(key) && src.hasOwnProperty(key)) {
      if (typeof proto[key] === "object" && proto[key] !== null) {
        result[key] =objectProjection(src[key], proto[key]);
      } else {
        result[key] = src[key];
      }
    }
  }

  return result;
};
const src = {
  prop11: {
    prop21: 21,
    prop22: {
      prop31: 31,
      prop32: 32,
    },
  },
  prop12: 12,
  prop13:{
    prop23:{
      prop33: 33,
      prop34: 34,
      prop35: 35
    }
  }
};

const proto = {
  prop11: {
    prop22: null,
  },
  prop13:{
    prop23:null
  }
};

const res = objectProjection(src, proto);

console.log(res);
