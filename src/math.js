/**
 * Finds the dot product between two vectors of the same dimension
 */
function dotProduct(x, y, length) {
   let sum = 0;

   for (let i = 0; i < length; i++) {
      sum += x[i] * y[i];
   }

   return sum;
}

/**
 * Calculates the Euclidean norm for a vector
 */
function euclideanNorm(vector) {
   /** Loop configuration **/
   let i = 0;
   const length = vector.length;

   /** Equation terms **/
   let t = 0,
      ratio = 0,
      s = 1,
      unsigned = 0;

   while (i < length) {
      if (vector[i] == 0) {
         i++;
         continue;
      }

      unsigned = vector[i] < 0 ? -vector[i] : vector[i];

      i++;

      if (unsigned > t) {
         ratio = t / unsigned;
         s = 1 + s * ratio ** 2;

         /** Override t for future **/
         t = unsigned;
         continue;
      }

      ratio = unsigned / t;
      s = s + ratio ** 2;
   }

   return t * Math.sqrt(s);
}

/**
 * Takes the cosine similarity of two vector of the same dimensions
 */
function cosineSimilarity(x, y, dimension) {
   const dot = dotProduct(x, y, dimension);

   const l2normX = euclideanNorm(x);
   const l2normY = euclideanNorm(y);

   return dot / (l2normX * l2normY);
}

/**
 * Ranks the first top values of an array of numbers
 */
function dynamicRank(array, top = 2) {
   if (array.length === 1) return [0];

   const len = array.length;

   let guns = new Array(top);

   let leftWing = 0,
      rightWing = leftWing + 1;

   while (rightWing < len) {
      const underdog =
         array[leftWing] > array[rightWing] ? leftWing : rightWing;

      for (let i = 0; i < top; i++) {
         if (guns[i] == undefined) {
            guns[i] = underdog;
            break;
         }

         if (array[underdog] > array[guns[i]]) {
            let hold = guns[i];
            guns[i] = underdog;
            guns[i + 1] = hold;
            break;
         }
      }

      leftWing++;
      rightWing = leftWing + 1;
   }

   guns.pop(); // clean last element;

   console.log(`The guns returned!`);
   return guns;
}

export { dynamicRank, euclideanNorm, cosineSimilarity };
