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

voltagekey_t::voltagekey_t (node_t* n1, node_t* n2)
{
      top_node = n1;
      bottom_node = n2;
      voltage = new voltage_t();
} /* voltagekey_t::voltagekey_t */


////////////////////////////////////////////

void voltagekey_t::SetTopNode (node_t *n)
{
    top_node = n;
    
    //n->connect?
        
} /* voltagekey_t::SetTopNode() */

////////////////////////////////////////////

void voltagekey_t::SetBottomNode (node_t *n)
{
    bottom_node = n;
    
    //n->connect?
        
} /* voltagekey_t::SetBottomNode() */

////////////////////////////////////////////

node_t* voltagekey_t::BottomNode ()
{
 return bottom_node;
} /* voltagekey_t::BottomNode() */

////////////////////////////////////////////

node_t* voltagekey_t::TopNode ()
{
 return top_node;
} /* voltagekey_t::TopNode() */

////////////////////////////////////////////

