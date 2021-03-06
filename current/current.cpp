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

current_t::current_t(branch_t* p) 
{
	parent_branch = p;
} /* current::current */

branch_t* current_t::ParentBranch() const
{
	return parent_branch;
} /* current_t::ParentBranch */

void current_t::SetParentBranch(branch_t* b ) 
{
	parent_branch = b;
} /*  current_t::SetParentBranch */





