import { Recipe } from '../types';

export const recipes: Recipe[] = [
  {
    id: '1',
    name: 'Classic Tomato Bruschetta',
    description: 'A timeless Italian appetizer featuring fresh tomatoes, basil, garlic, and olive oil on toasted bread.',
    category: 'Vegetarian',
    imageUrl: 'https://source.unsplash.com/800x600/?bruschetta',
    prepTime: 15,
    cookTime: 10,
    servings: 4,
    ingredients: [
      '4 large ripe tomatoes, diced',
      '1/2 cup fresh basil leaves, chopped',
      '2 cloves garlic, minced',
      '1 tbsp balsamic vinegar',
      '2 tbsp extra virgin olive oil',
      'Salt and pepper to taste',
      '1 baguette, sliced 1/2-inch thick'
    ],
    steps: [
      { description: 'Preheat oven to 375°F (190°C). Arrange baguette slices on a baking sheet.', time: 0 },
      { description: 'Toast the baguette slices until golden brown, then rub one side of each toast with a garlic clove. Set a timer for 7 minutes.', time: 420 },
      { description: 'In a medium bowl, combine diced tomatoes, chopped basil, minced garlic, balsamic vinegar, and olive oil.', time: 0 },
      { description: 'Season the tomato mixture with salt and pepper to taste. For the best flavor, let it sit to allow the flavors to meld. Start a 10-minute timer.', time: 600 },
      { description: 'Top each toasted baguette slice with a spoonful of the tomato mixture.', time: 0 },
      { description: 'Serve immediately and enjoy the fresh flavors!', time: 0 }
    ]
  },
  {
    id: '2',
    name: 'Spicy Honey-Glazed Salmon',
    description: 'A perfect balance of sweet and spicy, this salmon is quick to make and incredibly flavorful.',
    category: 'Non-Vegetarian',
    imageUrl: 'https://source.unsplash.com/800x600/?glazed-salmon',
    prepTime: 10,
    cookTime: 15,
    servings: 2,
    ingredients: [
      '2 (6-ounce) salmon fillets',
      '1 tbsp olive oil',
      'Salt and black pepper',
      '3 tbsp honey',
      '1 tbsp soy sauce',
      '1 clove garlic, minced',
      '1/2 tsp red pepper flakes'
    ],
    steps: [
      { description: 'Preheat your broiler. Pat the salmon fillets dry and season with salt and pepper.', time: 0 },
      { description: 'In a small bowl, whisk together honey, soy sauce, minced garlic, and red pepper flakes.', time: 0 },
      { description: 'Place salmon on a foil-lined baking sheet. Brush half of the honey glaze over the fillets.', time: 0 },
      { description: 'Place salmon under the broiler. Set a timer for 7 minutes. Afterwards, remove from the oven and brush with the remaining glaze.', time: 420 },
      { description: 'Return the salmon to the broiler until the salmon is cooked through and the glaze is bubbly. Set a timer for 5 minutes.', time: 300 },
      { description: 'Serve hot with your favorite side, like roasted asparagus or rice.', time: 0 }
    ]
  },
  {
    id: '3',
    name: '30-Minute Chicken Fajitas',
    description: 'A vibrant and smoky weeknight dinner that comes together in just one skillet.',
    category: 'Quick Meals',
    imageUrl: 'https://source.unsplash.com/800x600/?chicken-fajitas',
    prepTime: 10,
    cookTime: 20,
    servings: 4,
    ingredients: [
      '1 lb boneless, skinless chicken breasts, sliced',
      '1 red bell pepper, sliced',
      '1 green bell pepper, sliced',
      '1 onion, sliced',
      '2 tbsp olive oil',
      '1 packet fajita seasoning',
      '8 small flour tortillas',
      'Optional toppings: sour cream, salsa, guacamole'
    ],
    steps: [
      { description: 'In a large bowl, toss the sliced chicken with the fajita seasoning until well-coated.', time: 0 },
      { description: 'Heat olive oil in a large skillet or cast iron pan over medium-high heat.', time: 0 },
      { description: 'Add the seasoned chicken to the hot skillet and cook until browned and cooked through, stirring occasionally. Set a timer for 7 minutes.', time: 420 },
      { description: 'Add the sliced peppers and onion to the skillet. Continue to cook, stirring occasionally, until they are tender-crisp. Set a timer for 8 minutes.', time: 480 },
      { description: 'While the vegetables cook, warm the tortillas in a dry pan or microwave.', time: 0 },
      { description: 'Serve the chicken and vegetable mixture hot with warm tortillas and your favorite toppings.', time: 0 }
    ]
  },
  {
    id: '4',
    name: 'Fudgy Chocolate Brownies',
    description: 'The ultimate decadent and fudgy brownies, packed with rich chocolate flavor.',
    category: 'Desserts',
    imageUrl: 'https://source.unsplash.com/800x600/?chocolate-brownies',
    prepTime: 15,
    cookTime: 30,
    servings: 16,
    ingredients: [
      '1/2 cup unsalted butter, melted',
      '1 cup granulated sugar',
      '2 large eggs',
      '1 tsp vanilla extract',
      '1/3 cup unsweetened cocoa powder',
      '1/2 cup all-purpose flour',
      '1/4 tsp baking powder',
      '1/4 tsp salt',
      '1/2 cup chocolate chips'
    ],
    steps: [
      { description: 'Preheat oven to 350°F (175°C). Grease and flour an 8-inch square baking pan.', time: 0 },
      { description: 'In a large bowl, mix the melted butter and sugar. Beat in the eggs one at a time, then stir in the vanilla.', time: 0 },
      { description: 'In a separate bowl, whisk together cocoa powder, flour, baking powder, and salt.', time: 0 },
      { description: 'Gradually add the dry ingredients to the wet ingredients and mix until just combined. Do not overmix.', time: 0 },
      { description: 'Fold in the chocolate chips.', time: 0 },
      { description: 'Spread the batter evenly into the prepared pan.', time: 0 },
      { description: 'Place the pan in the preheated oven to bake. Set a timer for 30 minutes. The brownies are done when a toothpick inserted into the center comes out with moist crumbs.', time: 1800 },
      { description: 'Let cool completely in the pan before cutting into squares.', time: 0 }
    ]
  }
];