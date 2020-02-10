var budgetController = (function(){
    
    var Expense = function(id,description,value){
      
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
    Expense.prototype.calcPercentage = function(totalIncome){
        
         if(totalIncome >0)
          this.percentage= Math.round((this.value/totalIncome)*100);
            else
            this.percentage= -1;
        
    };
    
    Expense.prototype.getPercentage = function(){
      return this.percentage;  
    };
    
    var Income = function(id,description,value){
      
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    var calculateTotal = function(type){
            var sum=0;
        
            data.allItems[type].forEach(function(cur){
                sum+= cur.value;
            });
        data.totals[type]= sum;
           
        };
       
    
    var data = {
        
        allItems: {
            exp: [],
            inc: []
        },
        
        totals: {
            
          exp: 0,
          inc: 0            
        },
        budget: 0,
        percentage: -1
    }; 
    
    return {
      
             addItem: function(type,des,val){
             var newItem,ID;
             
                 //create new ID
             if (data.allItems[type].length>0) {
                 ID=data.allItems[type][data.allItems[type].length-1].id + 1;                 
                }    
                 else
                     ID=0;
                 
                 //create new item based on 'inc' or 'exp' type
                 if(type === 'exp'){
                     newItem=new Expense(ID,des,val);
                 } else if(type === 'inc'){
                     newItem=new Income(ID,des,val);
                 }
                 
                 //push it in to data structure
                 data.allItems[type].push(newItem);
                 
                 //return the new element
                 return newItem;
          },
       
        
          deleteItem: function(type, id) {
            var ids, index;
            
            // id = 6
            //data.allItems[type][id];
            // ids = [1 2 4  8]
            //index = 3
            
            ids = data.allItems[type].map(function(current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
            
        },
      
        calculatePercentages: function(){
          
            data.allItems.exp.forEach(function(cur) {
                cur.calcPercentage(data.totals.inc);
            });
            
        },
        
        getPercentages: function(){
          
             var allPerc = data.allItems.exp.map(function(cur) {
                return cur.getPercentage();
            });
             
            return allPerc;
            
        },
        
        
        calculeteBudget : function(){
          
          calculateTotal('exp');
          calculateTotal('inc');
            
          data.budget= data.totals.inc - data.totals.exp;
            
          if(data.totals.inc>0)
          data.percentage= Math.round((data.totals.exp/data.totals.inc)*100);
            else
            data.percentage= -1;
        },
        
        getBudget: function(){
          return{
              budget: data.budget,
              totalInc: data.totals.inc,
              totalExp: data.totals.exp,
              percentage: data.percentage
          }  
        },
        testing: function(){
            console.log(data);
        }
        
    };
})();



var UIController = (function(){
     var DOMstrings={
         inputType:'.add__type',
         inputDescription:'.add__description',
         inputValue:'.add__value',
         inputBtn:'.add__btn',
         incomeContainer:'.income__list',
         expensesContainer:'.expenses__list',
         budgetLabel:'.budget__value',
         incomeLabel:'.budget__income--value',
         expensesLabel:'.budget__expenses--value',
         percentageLabel:'.budget__expenses--percentage',
         container: '.container',
         expensesPercLabel: '.item__percentage',
         dateLabel: '.budget__title--month'
     };
    var formateNumber = function(num,type){
      var numSplit, int, dec, type;
        
        num= Math.abs(num);
        num= num.toFixed(2);
        
        numSplit= num.split('.');
        int = numSplit[0];
        if(int.length> 3){
            int= int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }
        dec=numSplit[1];
        
        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec; 
    };
    
    var nodeListForEach = function(list, callBack){
              
                for(var i=0; i<list.length; i++)
                    callBack(list[i], i);                
            };
            
    return{
       getInput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // Will be either inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },
        
        addListItem: function(obj, type/*,budget*/){
            var html,newHtml,element;
            //create a HTML string with placeholder text
            
            if(type === 'inc'){
                element= DOMstrings.incomeContainer;
                            html= '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

            } else if(type === 'exp'){
                element= DOMstrings.expensesContainer;
                            html= '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">%percentage%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'

            }
             
            //replace the placeholder text with actual values
            
            newHtml=html.replace('%id%', obj.id);
            newHtml=newHtml.replace('%description%', obj.description);
            newHtml=newHtml.replace('%value%',formateNumber(obj.value, type));
            
           /* if(budget.percentage> 0)
            newHtml=newHtml.replace('%percentage%', budget.percentage + '%');
            else
            newHtml=newHtml.replace('%percentage%', '---');
            */
            //add placeholder to UI
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
            
            
        },
        
        deleteListItem: function(selectorID){
          
            var el=document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },
        
        clearFields: function(){
            var fields,fieldsArr;
            
            fields= document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);
            
            fieldsArr=Array.prototype.slice.call(fields);
            
            fieldsArr.forEach(function(current, index, array){
               current.value = ""; 
            });
            fieldsArr[0].focus();
        },
        
        displayBudget: function(obj){
            
            var type;
            
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            
            document.querySelector(DOMstrings.budgetLabel).textContent = formateNumber(obj.budget,type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formateNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formateNumber(obj.totalExp, 'exp');
            
            if(obj.percentage >0)
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            else
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
        },
        
        displayPercentages: function(percentages){
          
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
            
            nodeListForEach(fields,function(current, index){
               
                if(percentages[index] > 0)
                    {
                        current.textContent = percentages[index] + '%';
                    }
                else{
                    current.textContent = '---';
                }            
            });
            
        },
        
        displayMonth: function(){
          var now,year,month,months;
            
            now = new Date();
            
            year = now.getFullYear();
            
            months=['January' , 'February' , 'March' , 'April' , 'May' , 'June' , 'July' , 'August' , 'September' , 'October' , 'November' , 'December'];
            
            month=now.getMonth();
            
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
            
        },
        
        changedType: function(){
            
            var fields = document.querySelectorAll(DOMstrings.inputType + ',' + DOMstrings.inputDescription + ',' + DOMstrings.inputValue);
            
            nodeListForEach(fields, function(cur){
                cur.classList.toggle('red-focus');
            });
            
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
            
        },
        
        getDomStrings: function(){
            return DOMstrings;
        }
   
    
    };    
})();



var controller = (function(budgetCtrl,UICtrl) {
    
     var setupEventListener = function() {
         
         var DOM = UICtrl.getDomStrings();
         
        document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);
    
        document.addEventListener('keypress',function(event){
        
             if(event.KeyCode === 13 || event.which === 13 )
             ctrlAddItem(); 
        });
         
         document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);
         document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
     };
     
    var updateBudget = function(/*newItem,input*/){
        var budget;
        //calculate the budget
        budgetController.calculeteBudget();
        
        //return budget
        budget=budgetController.getBudget();
        
        //display the budgets on UI
        UICtrl.displayBudget(budget);
        
        //UICtrl.addListItem(newItem, input.type, budget);
        
        //UICtrl.clearFields();
    };
    var updatePercentages = function(){
      
        //Calculate the percentages
        budgetCtrl.calculatePercentages();
        
        //Read the percentages from the budget controller
         var percentages= budgetCtrl.getPercentages();
        
        //display the percentages on UI
        UICtrl.displayPercentages(percentages);
        
    };
    
    
    var ctrlAddItem = function(){
       var input,newItem;
        
        //get the field input data
       input=UICtrl.getInput();
        if(input.description!="" && !isNaN(input.value) && input.value>0 ){
            
        //Add the items to the budget controller
       newItem=budgetCtrl.addItem(input.type,input.description,input.value);
            
            //updateBudget(newItem,input);
        
        //Add the items to UI

         UICtrl.addListItem(newItem, input.type);
        
        //clear the fields
        UICtrl.clearFields();
        
        //call updateBudget
            updateBudget();
            
            updatePercentages();
        }
        
        
  
    };
    
    var ctrlDeleteItem = function(event){
      var itemID,splitID,type,ID;
        
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if(itemID)
            {
                splitID=itemID.split('-');
                type=splitID[0];
                ID= parseInt(splitID[1]);
                
                //delete the item from the data stucture
                budgetController.deleteItem(type, ID);
                                            
                //delete the item fromthe UI
                UIController.deleteListItem(itemID);
                
                //update and show the budget
                updateBudget();
                
                updatePercentages();
                
            }
        
    };
    
    return{
         init: function(){
             
             UICtrl.displayMonth();
          console.log('start');
          UICtrl.displayBudget({
              budget: 0,
              totalInc: 0,
              totalExp: 0,
              percentage: -1
          }  );

          setupEventListener();
            
        },
    };
         
         
})(budgetController,UIController);

controller.init();