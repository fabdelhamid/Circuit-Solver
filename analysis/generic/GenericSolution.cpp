#include "../../NodeAnalyzer.h"


	/* 
		TODO: this should be moved to its own method when finished.
		The method of solving a problem (regardless of the approach; KCL, KVL, etc.)
		
		1. Generate basic equations.
		
		  Example (KCL)
		    Current(R 1) + Current(R 2) + Current(R 3) = 0
		    
		2. Record which variables have been used in the equations.
		3. Define them using a single or multiple equations for each variable
		4. Matrix-solve them.	
	*/
		
		
	/*
	  Example KCL solution 
	  */
	
// TODO: the prototype of this function needs to be changed when done
	
void GenericSolution (circuit_t& circuit)
{

	circuit.solve ();

} /* GenericSolution */




