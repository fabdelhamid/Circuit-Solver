#include "../../NodeAnalyzer.h"
// Parallel element reduction 
// Condition: same nodes. TODO: what about equivalent nodes, as in an OPAMP?

coupled_item_list_t circuit_t::GetParallelLists ()
{
   coupled_item_list_t result;
   item_list_t current_list;

   for (list<element_t*>::iterator p = elements.begin(); p != elements.end(); p++)
   {
   	   current_list.clear();
       if ((*p)->type == E_RESISTOR || (*p)->type == E_INDUCTOR || (*p)->type == E_CAPACITOR || (*p)->type == E_IMPEDANCE 
           || (*p)->type == E_CSRC)
	    {
              
            item_t t_item (*p, false);
            current_list.push_back (t_item);

            for (list<element_t*>::iterator z = elements.begin(); z != elements.end(); z++)
                {
                   if (*z != *p && (*z)->type == (*p)->type && SharedNodes (*p, *z) == 2)
                     {
                     	    item_t t_item (*z, false);
				            current_list.push_back (t_item);

                     } /* if */
                } /* for */ 
        } /* if */
   } /* for */

   // add all couples to main list, callee takes care of duplicates
   AddList (current_list, result);	
		
} /* circuit_t::get_parallel_lists */

unsigned int circuit_t::ReduceParallelElements ()
{
   unsigned int result = 0;
   
   coupled_item_list_t parallel_lists = GetParallelLists ();
   while (parallel_lists.size() > 0)
   {         
       ReduceParallelList (parallel_lists.front());       
       
       result++;
       
       parallel_lists = GetParallelLists ();
   } /* while */               
  
   return result;
	
} /* circuit_t::reduce_parallel_elements */

void circuit_t::ReduceParallelList (const item_list_t &parallel_list)
{
     
     item_t  first_item      = parallel_list.front();
     node_t* new_top_node    = first_item.e->TopNode();
     node_t* new_bottom_node = first_item.e->BottomNode();

     string new_value = "";
     
     
     // Cap, Current Source
    if (first_item.e->type == E_CAPACITOR || first_item.e->type == E_CSRC)
     {
         for (item_list_t::const_iterator i = parallel_list.begin(); i != parallel_list.end(); i++)
             {
            	if (i->e->type == E_VSRC)
                {
                     new_value +=  i->e->GetValueAsString(i->direction);
                     if (next(i) != parallel_list.end()) new_value += " + ";
                     
                } /* if */
                else
                {
                      new_value +=  i->e->GetValueAsString();
                      if (next(i) != parallel_list.end()) new_value += " + "; 
                } /* else */ 
                   
                DisconnectElement (i->e);
             } /* for */
                           
     } /* if */
     
     // all elements
     else
      {
     	
             new_value = "(";
             for (item_list_t::const_iterator i = parallel_list.begin(); i != parallel_list.end(); i++)
              {
                	new_value +=  i->e->GetValueAsString(i->direction) +  "^(-1)";
                     if (next(i) != parallel_list.end()) 
                        new_value += " + ";                       
              
                      DisconnectElement (i->e);
                      
              } /* for */
             new_value += ")^(-1)";

      	
      	
      } /* else */
       
      element_t* new_element = AddElement (NONE, first_item.e->type, 0, ITEM_DIRECTION_FWD, new_top_node, new_bottom_node);
      new_element->SetValueFromString (new_value);
      
      Reconstruct();
      //solution->add_step (STEP_PARALLEL_REDUCTION, parallel_list);      

	
} /* circuit_t::reduce_parallel_list */


