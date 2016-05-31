var NumberFormatter = {
      /**
       * @private
       *
       * @param {Number} number Number to format
       * @param Integer Number of digits after comma, defaults to 1
       * @param {Integer} base Base to be used - defaults to 1000.
       * @param {String[]} sizes Array of postfixes to be used, defaults to ['', 'K', 'M', 'G', 'T', 'P']
       *
       * @returns String Formatted number with postfix.
       **/
      _format: function(num, precision, base, sizes) {
         num = Number(num);

         if(precision === undefined) {
            precision = 1;
         }

         if(num<0) {
            return "-"+this._format((num*-1), precision, base, sizes);
         }

         base = base || 1000;
         sizes = sizes || ['', 'K', 'M', 'G', 'T', 'P'];

         if(num == 0) {
            return num;
         }

         if(num<1) {
            return num.toFixed(precision);
         }

         var i = parseInt(Math.floor(Math.log(num) / Math.log(base)));

         //use the largest available postfix but not any bigger
         i = Math.min(i, sizes.length-1);

         var divided = num / Math.pow(base, i);

         var postfix = sizes[i];
         var nbsp = '&nbsp;';
         if(postfix == '') {
            nbsp = '';
         }

         if(divided == Math.round(divided)) {
            //is integer
            return divided + nbsp + sizes[i];
         } else {
            //is decimal
            return divided.toFixed(precision) + nbsp + sizes[i];
         }
      },


      /**
       * @param {Number} number Number to format
       * @param Boolean true to treat number as bytes (with 1024 base)
       * @param Integer Number of digits after comma, defaults to 1
       *
       * @returns String Number with unit.
       **/
      format: function(num, areBytes, precision) {
         var base = 1000;
         var sizes = ['', 'K', 'M', 'G', 'T', 'P'];

         if(areBytes) {
            base = 1024;
            sizes = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB'];
         }

         return this._format(num, precision, base, sizes);
      }
}




// Usage

var aLotOfFlows = 123456789;
var aLotOfBytes = 123456789;

var formattedFlows = NumberFormatter.format(aLotOfFlows);
//123.5&nbsp;M - it is displayed as 123.5 M when used in html

var formattedBytes = NumberFormatter.format(aLotOfBytes, true);
//117.7&nbsp;MiB - it is displayed as 117.7 MiB when used in html


