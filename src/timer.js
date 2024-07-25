
class InternalClock
{
   constructor()
   {
      this.second = 0;
      this.minute = 0;

      this.element = document.getElementById("clock");
   }

   addSecond()
   {
      this.second++;

      if(this.second === 59)
      {
         this.second = 0;
         this.minute++;
      }

      if(this.limit == this.minute)
      {
       this.callback();
      }
   }


   setLimitMinute( number, func )
   {

      this.limit = number;
      this.callback = func;
   }

   cleanElement()
   {
      this.element.textContent = "";
   }
}

let clock;


function restarter()
{
   // This means that the clock have been destroyed
   if(window.innerClock === undefined)
      return;

   setTimeout(mark, 1000);
}

function mark()
{
   if(window.innerClock == undefined)
      return;

   let delimiter = ":";

   clock.addSecond();

   let format = "0:00";

   let seconds, minutes;

   minutes = `${clock.minute}`;
   seconds = `${clock.second}`;

   if(clock.second < 10)
   {
      seconds = `0${clock.second}`;
   }

   clock.element.textContent = `${minutes}${delimiter}${seconds}`;

   restarter();
}

/**
 * Start the timer with a limit time and a callback
 */
function startTimer( limit, func)
{
   if(limit === undefined)
   {
      limit = 0;
   }

   if(func === undefined)
   {
      func = () => {};
   }

   clock = new InternalClock();

   clock.setLimitMinute( limit, func );

   window.innerClock = clock;

   restarter();
}

function stopTimer()
{
   clock.cleanElement();

   delete window.innerClock;
}
