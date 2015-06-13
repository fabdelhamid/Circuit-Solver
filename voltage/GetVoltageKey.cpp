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
	Gets a voltage key for given two nodes. 
	*/
voltage_t* circuit_t::GetVoltageKey (node_t* node_1, node_t* node_2)
{
           
   // Check for existing key
   for (voltagekey_list_t::iterator i = voltagekeys.begin(); i != voltagekeys.end(); i++)
      if ((SameOrVshortedNodes (i->TopNode(), node_1) && SameOrVshortedNodes (i->BottomNode(), node_2))
           || (SameOrVshortedNodes (i->TopNode(), node_2) && SameOrVshortedNodes (i->BottomNode(), node_1)))
         return i->voltage;   
    
   // Create new key
   voltagekey_t t_vk  (node_1, node_2);
   voltagekeys.push_back (t_vk);
   
   return voltagekeys.back().voltage;         
} /* circuit_t::GetVoltageKey */
