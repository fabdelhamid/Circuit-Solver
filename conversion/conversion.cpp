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

void AddCouple  (const item_list_t& a, coupled_item_list_t& c)
{
	AddIfNoEquivalent (a,c);
} /* AddCouple */

	////////////////////////////////////////////////////////////

void AddTriplet (const item_list_t& a, coupled_item_list_t& c)
{
	AddIfNoEquivalent (a,c);	
} /* AddTriplet */

	////////////////////////////////////////////////////////////

void AddList    (const item_list_t& a, coupled_item_list_t& c )
{
	AddIfNoEquivalent (a,c);	
} /* AddList */

	////////////////////////////////////////////////////////////

void AddIfNoEquivalent (const item_list_t& a, coupled_item_list_t& c )
{
   for (coupled_item_list_t::iterator i = c.begin(); i != c.end(); i++)
	  if (EquivalentItemLists (*i, a))
	    return;
	    
   c.push_back(a);
	
} /* AddList */

bool EquivalentItemLists (const item_list_t& a, const item_list_t& b )
{
	
	// direction check is ignored because it has no apparent use.
	// if needed, it must be implemented as a flag to retain current functionality.
	
	// size check
	if (a.size() != b.size())
	 return false;
	 
	for (item_list_t::const_iterator i = a.begin(); i != a.end(); i++)
	for (item_list_t::const_iterator j = b.begin(); j != b.end(); j++)
	{
	
	   if (i->e == j->e)
	      break;	  
	   else if ((i->e != j->e) && (j == b.end()))
		  return false;
	
	} /* for */
	
	return true;
} /* EquivalentItemLists */




