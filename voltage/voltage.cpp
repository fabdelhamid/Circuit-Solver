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

voltage_t::voltage_t ()
{	
} /* voltage_t::voltage_t */


void voltage_t::add_mutual_innductance (element_t* other_element, float coeff)
{
    this->mutual_inductance_coeff.push_back (coeff);
    this->mutual_inductance_other_element.push_back (other_element);
    // if other current is reversed, this is automatically dealt with from the calling function
    // by negating coeff
        
} /* voltage_t::add_mutual_conductance */
