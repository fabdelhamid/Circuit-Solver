#include "../../NodeAnalyzer.h"

/*
  wye-Delta conversion
   Condition for conversion:
   A (super)node is shared by 3 elements, ONLY THREE elements. 
   Ohter node has to be different, otherwise parallel reduction/equivalency takes precedence. 
   
   function should be called after each action
*/

coupled_item_list_t circuit_t::GetWyeTriplets ()
{
   coupled_item_list_t result;
   item_list_t current_list;

   for (list<element_t*>::iterator  p = elements.begin(); p != elements.end(); p++)
   {
   	  current_list.clear();
       if ((*p)->type == E_RESISTOR || (*p)->type == E_INDUCTOR || (*p)->type == E_CAPACITOR || (*p)->type == E_IMPEDANCE )
	    {
			item_t t_item (*p,false);
            current_list.push_back (t_item);
			ident main_element_type = (*p)->type;
		    // get all couples
		    for (list<element_t*>::iterator i = elements.begin(); i != elements.end(); i++)
		      if ((*i)->type == main_element_type
                    && *i != *p /* <<not needed but faster */
                    && (SharedNodes (*p, *i) == 1)
                    && (SharedNode (*p, *i)->elements.size() == 3))
		        {
                  if ((*p)->TopNode() == (*i)->TopNode())
                  {
				       item_t t_item (*i,false);
				       current_list.push_back (t_item); 
				   } /* if */
				  else
				   {  
				   	   item_t t_item (*i,true);
				       current_list.push_back (t_item); 
			  	   } /* else */
                } /* if */	
                
			// add all couples to main list, callee takes care of duplicates
			AddTriplet (current_list, result);
		} /* if */	
   } /* for */
} /* get_wye_triplets */


unsigned int circuit_t::ConvertWyeToDelta ()
{
     unsigned int result = 0;
     
     coupled_item_list_t wye_triplets = GetWyeTriplets ();
     
     while (wye_triplets.size() > 0)
     {
                  
        //see: http://en.wikipedia.org/wiki/Y-%CE%94_transform
        ConvertWyeTriplet (*wye_triplets.begin());
          
        // get new list
        // coupled item list should be cleared now
        wye_triplets.clear();
        wye_triplets = GetWyeTriplets ();
        
     } /* while */
     
     return result;
} /* circuit_t::convert_wye_to_delta */



void circuit_t::ConvertWyeTriplet (item_list_t &wye_triplet)
{
        
        ///////////  actual conversion from wye to delta /////////////
       item_list_t::iterator a = wye_triplet.begin();
        item_t  i1 = *a++, 
		        i2 = *a++, 
				i3 = *a;
        
        // Wye elements:    R1, R2, R3
        // Delta elements:  Ra, Rb, Rc
        
        // original (wye elements)
        
        element_t* e1 = i1.e;	 
        element_t* e2 = i2.e;
        element_t* e3 = i3.e;
        
        node_t* common_node = SharedNode (e1,e2);
        
        // #define OtherGennode(x) x.other_node(common_node)      		         
		//Format: AddElement (top_node, bottom_node)         
		         
		         
        // delta ea
        element_t*  ea = AddElement (NONE, e1->type, 0, ITEM_DIRECTION_FWD, OtherGennode(e3), OtherGennode(e2));
                    
        // delta eb        
        element_t*  eb = AddElement (NONE, e2->type, 0, ITEM_DIRECTION_FWD, OtherGennode(e3), OtherGennode(e1));

        // delta ec        
        element_t*  ec = AddElement (NONE, e3->type, 0, ITEM_DIRECTION_FWD, OtherGennode(e1), OtherGennode(e2));
        
        
        ea->SetValueFromString (WyeToDeltaString  (e1,e2,e3,e1));
        ea->SetValueFromString (WyeToDeltaString  (e1,e2,e3,e2));
        ea->SetValueFromString (WyeToDeltaString  (e1,e2,e3,e3));
        
        DisconnectElement (e1); // Retains relations
        DisconnectElement (e2);
        DisconnectElement (e3);
        
                
        //solution->add_step (STEP_CONVERT_WYE_TO_DELTA);
        
        Reconstruct();  //involves reassignment of branches
     
} /* circuit_t::convert_wye_triplet */


string WyeToDeltaString (const element_t* e1, const element_t* e2, const element_t* e3, const element_t* ex)
{
	const element_t *other[2] ;
	string result = "";
	
	if (ex == e1)
	 {
	 	other [0] = e2;
	 	other [1] = e3;
	 } /* if */
	else if (ex == e2)
	 {
	 	other [0] = e1;
	 	other [1] = e3;
	 } /* else if */
	else if (ex == e3)
	 {
	 	other [0] = e1;
	 	other [1] = e2;
	 } /* else if */
	 
	 result =  "(" + other[0]->GetValueAsString() + "*"  + other[0]->GetValueAsString() + ")";
	 result += " / ";
	 result += "(" ;
	 result += e1->GetValueAsString() + " + ";
	 result += e2->GetValueAsString() + " + "; 
	 result += e3->GetValueAsString() + ")"; 
	 	 
	 return result;

	
} /* WyeToDeltaString */

