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


void print_ctr (const string &msg)
{
   int x = 80/2 - msg.length()/2;

   while (x--)
     cout << " ";

   cout << msg << endl;
} /* print_ctr */


void error_ctr (const string &msg)
{
   int x = 80/2 - msg.length()/2;

   while (x--)
     cerr << " ";

   cerr << msg << endl;
} /* print_ctr */
