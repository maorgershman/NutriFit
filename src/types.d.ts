/// <reference types="react-scripts" />

type StateDispatcher<T> = React.Dispatch<React.SetStateAction<T>>;
type State<T> = [T, StateDispatcher<T>];
type Ref<T> = React.MutableRefObject<T>;

type NutritionalValues = {
  energy: number,
  protein: number,
}

type Food = {
  creator: string,
  name: string,
  valuesPer100g: NutritionalValues,
}

type Meal = Food & {
  ingredients: Ingredient[],
  values: NutritionalValues,
}

type Ingredient = {
  originalId: string,
  type: 'food' | 'meal',
  weight: number,
  value: Food, // Meal is a type of food
}

type FoodDict = {
  [id: string]: Food
}

type MealDict = {
  [id: string]: Meal
}
