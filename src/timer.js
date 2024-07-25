
class InternalClock
{
   constructor()
   {
      this.second = 0;
      this.minute = 0;
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
}

let clock;


function restarter()
{
   setTimeout(mark, 1000);
}

function mark()
{
   // Take the p
   let timer = document.getElementById("clock");

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

   timer.textContent = `${minutes}${delimiter}${seconds}`;

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

   clock.SetLimitMinute( limit, func );
}
