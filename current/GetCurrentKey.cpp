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

/*
	Gets a current key for a given display id. 
	*/
current_t* circuit_t::GetCurrentKey (ident display_id, branch_t* parent)
{
    
   // Check for existing key
   for (currentkey_list_t::iterator i = currentkeys.begin(); i != currentkeys.end(); i++)
   {
      if ((*i).display_id == display_id)
      {
         return (*i).current;   
	  } /* if */
         
   } /* for */

   // Create new key
   currentkey_t t_ck  (display_id,parent);
   currentkeys.push_back (t_ck);
   
   return currentkeys.back().current;         
} /* circuit_t::GetCurrentKey */






