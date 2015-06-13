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
#define CONVERSION_H
#define OtherGennode(x) x->OtherNode (common_node)         


        
string WyeToDeltaString  (const element_t*,const element_t*,const element_t* ,const element_t* target);
string DeltaToWyeString  (const element_t* ,const element_t*,const element_t*,const element_t* target);


void AddCouple  (const item_list_t&, coupled_item_list_t& );
void AddTriplet (const item_list_t&, coupled_item_list_t& );
void AddList    (const item_list_t&, coupled_item_list_t& );
void AddIfNoEquivalent    (const item_list_t&, coupled_item_list_t& );
bool EquivalentItemLists ( const item_list_t&, const item_list_t&);


