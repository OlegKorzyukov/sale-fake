const axios = require('axios');
//const puppeteer = require('puppeteer');
const $ = require('cheerio');
const http = require('http');

function optionsPage(pageNum = 1){
   let page = {
      url:'https://www.lamoda.ua/c/17/shoes-men/?sort=price_asc&page=' + pageNum,
      domain: getDomainFromLink(this.url),
      protokol: getHttpProtokolFromLink(this.url),
      currentPage: pageNum
   }
   return page;
}

function getDomainFromLink(link){
   let regExp = /(?:[\w-]+\.)+[\w-]+/;
   return String(regExp).match(link);
}

function getHttpProtokolFromLink(link) { 
   let regExp = /^(https|http).*/;
   return String(regExp).match(link);
}

function getHtml(url){
   return axios.get(url).then(response => response.data)
}

function getAllData(html){
      var data = {
         catalogHead: $('.products-catalog__head h2', html).text(),
         allItem: parseInt($('.products-catalog__head-counter', html).text()),
         info: {
            page: {}
         }
      };
   
      $('.products-list-item', html).each((index, value) => {
         data.info.page[index] = {
            sku: $(value).attr('data-sku'),
            position: $(value).attr('data-position'),
            image: optionsPage().domain + $(value).attr('data-src'),
            link: optionsPage().domain + $(value).children('a').attr('href'),
            price_old: $(value).find('.price__old').text(),
            price_new: $(value).find('.price__new').text(),
            price_action: $(value).find('.price__action').text(),
            brand: $(value).find('.products-list-item__brand').clone().children().remove().end().text().replace(/\s+/g, ''),
            type: $(value).find('.products-list-item__type').text().replace(/\s+/g, ''),
            discount_info: $(value).find('.products-list-item__cd').attr('data-countdown')
         };
      });

      return data;
}

function getNumberAllPage(allItem, itemPerPage = 60){
   return Math.ceil(allItem / itemPerPage);
}

 const server =  http.createServer((req, res) => {
   res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8'
   });

   var allPage = 5;
    for(let page = 1; page <= allPage; page++){
      getHtml(optionsPage(page).url)
      .then(response => getAllData(response))
      .then(data => {
         data.info.page.currentPage = page;
         console.log(data);
         res.end(JSON.stringify(data));
      });
   }
}); //http.createServer

server.listen(3000, () => {
   console.log('server started ... ');
});

