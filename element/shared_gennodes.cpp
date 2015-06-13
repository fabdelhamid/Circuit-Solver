/*
    Symbolic Circuit Analyzer - 2014,2015 Fady Abdelhamid <fabdelhamid@gmail.com>

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Fady's Circuit Solver is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Fady's Circuit Solver.  If not, see <http://www.gnu.org/licenses/>.
*/
#include "../NodeAnalyzer.h"

// returns number of shared nodes between two elements
unsigned int SharedNodes (element_t* a, element_t* b)
{
	int result = 0;
	
	if (a->TopNode() == b->TopNode()) 
	  {
	    result++;
		if (a->BottomNode() == b->BottomNode()) result++;
	  } /* if */


	if (a->BottomNode() == b->TopNode()) 
	  {
	    result++;
		if (a->TopNode() == b->BottomNode()) result++;
	  } /* if */
	  
	  return result;
	  	
} /* SharedNodes */


/* Assuming 2 elements share only one shared node,
    this node is returned */
node_t* SharedNode (element_t* a, element_t* b)
{
	int result = 0;
	
	if (a->TopNode() == b->TopNode())         return a->TopNode();
	if (a->BottomNode() == b->BottomNode())   return a->BottomNode();
	if (a->BottomNode() == b->TopNode())      return a->BottomNode();
	if (a->TopNode() == b->BottomNode())       return a->TopNode();
} /* SharedNode */

