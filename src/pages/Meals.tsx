import { useContext, useEffect, useState } from 'react';
import { addDoc, collection, deleteDoc, doc, getDocs, getFirestore, onSnapshot, orderBy, query, updateDoc, where } from 'firebase/firestore';
import { Context } from '../Context';
import { Modal, ModalState, useModal } from '../Modal';

type Item = Meal;
type ItemDict = {
  [key: string]: Item
};
type ItemEditDict = {
  [key: string]: boolean
};

const db = getFirestore();
export const Meals = () => {
  const ctx = useContext(Context);
  const auth = ctx.auth!;

  const [items, setItems] = useState<ItemDict>();
  const [modalState, setModalState] = useModal();

  const [currentlyEditing, setCurrentlyEditing] = useState<string>();

  useEffect(() => {
    console.log('Meals subscribed');

    const unsubscribe = onSnapshot(query(
      collection(db, 'meals'),
      where('creator', '==', auth.uid),
      orderBy('name'),
    ), async (querySnapshot) => {
      const newItems = {} as ItemDict;

      querySnapshot.forEach((itemObj) => {
        const itemId = itemObj.id;
        const item = itemObj.data() as Item;

        newItems[itemId] = item;
      });

      setItems(newItems);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const deleteItem = async (itemId: string) => {
    const sure = window.confirm('Are you sure?');
    if (!sure) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'meals', itemId));
    } catch (err: any) {
      alert(err.message);
    }
  }

  return (
    <>
      <h1>Meals</h1>
      <div
        className='container card'
      >
        <div
          className='table-responsive flex'
          style={{
            margin: '0.5rem'
          }}
        >
          <div>
            <div
              className='btn-like'
              style={{
                color: 'white',
                padding: '0.5rem 0',
                cursor: 'pointer',
                display: 'inline-block',
              }}
              onClick={() => {
                setModalState('fade-in');
              }}
            >
              <span>➕</span>
              &nbsp;
              <span className='btn-like-to-be-styled'>Add a meal...</span>
            </div>
          </div>
          <table
            className='table align-middle'
          >
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Energy (kcal)</th>
                <th>Protein (g)</th>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              { // Skeleton loading
                !items &&
                Object.entries([null, null, null, null, null]).map((_, index) => {
                  return (
                    <tr key={index}>
                      <td></td>
                      <td>
                        <div className='skeleton-line'></div>
                      </td>
                      <td>
                        <div className='skeleton-line'></div>
                      </td>
                      <td>
                        <div className='skeleton-line'></div>
                      </td>
                      <td>
                        <button className='btn' disabled style={{ visibility: 'hidden' }}>✏️</button>
                      </td>
                      <td>
                        <button className='btn' disabled style={{ visibility: 'hidden' }}>🗑️</button>
                      </td>
                    </tr>
                  );
                })
              }

              {
                items &&
                Object.entries(items).map(([itemId, item], index) => {
                  return (
                    <tr key={itemId}>
                      <td>{index + 1}.</td>
                      <td>{item.name}</td>
                      <td>{item.values.energy}</td>
                      <td>{item.values.protein}</td>
                      <td>
                        <button
                          className='btn'
                          type='button'
                          onClick={() => {
                            setCurrentlyEditing(itemId);
                            setModalState('fade-in');
                          }}
                        >
                          ✏️
                        </button>
                      </td>
                      <td>
                        <button
                          className='btn'
                          type='button'
                          onClick={() => {
                            deleteItem(itemId);
                          }}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  );
                })
              }
            </tbody>
          </table>
        </div>
      </div>

      <AddOrEditMealModal
        modalState={modalState}
        setModalState={setModalState}
        meals={items}
        initialMealAndId={items && currentlyEditing ? [items[currentlyEditing], currentlyEditing] : undefined}
        onHide={() => {
          setCurrentlyEditing(undefined);
        }}
      />
    </>
  );
}

const AddOrEditMealModal = (props: {
  modalState: ModalState,
  setModalState: StateDispatcher<ModalState>,
  initialMealAndId?: [Meal, string],
  meals: MealDict | undefined,
  onHide?: () => void | Promise<void>,
}) => {
  type NewIngredient = {
    state: 'shown',
    source: 'existing',
    value: Ingredient,
  } | {
    state: 'shown' | 'adding',
    source: 'new',
    value: {
      weight: number,
      value: Food,
    },
  } | {
    state: 'hidden',
  }

  const { modalState, setModalState, initialMealAndId, meals, onHide } = props;

  const ctx = useContext(Context);
  const auth = ctx.auth!;

  const isNew = initialMealAndId ? false : true;
  const initialMeal = initialMealAndId ? initialMealAndId[0] : undefined;
  const initialMealId = initialMealAndId ? initialMealAndId[1] : undefined;

  const [meal, setMeal] = useState<Meal>(generateDefaultMeal(auth.uid));

  const [newIngredient, setNewIngredient] = useState<NewIngredient>({
    state: 'hidden',
  });

  const [foods, setFoods] = useState<FoodDict>();

  const [isSubmitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (modalState !== 'fade-in') {
      return;
    }

    if (initialMeal) {
      setMeal(initialMeal);
    }

    // When the modal starts fading in, load all the foods from firestore.
    (async () => {
      const querySnapshot = await getDocs(query(
        collection(db, 'foods'),
        where('creator', '==', auth.uid),
        orderBy('name'),
      ));

      const newFoods = {} as FoodDict;

      querySnapshot.forEach((itemObj) => {
        const itemId = itemObj.id;
        const item = itemObj.data() as Item;

        newFoods[itemId] = item;
      });

      setFoods(newFoods);
    })();
  }, [modalState]);

  const generateAddAnIngredientButton = () => {
    if (typeof meals === 'undefined' || typeof foods === 'undefined') {
      return (
        <div>
          Loading...
        </div>
      );
    }

    return (
      <div
        className='btn-like'
        onClick={() => {
          const mealEntries = Object.entries(meals).filter(([mealId]) => mealId !== initialMealId);
          const foodEntries = Object.entries(foods);

          if (mealEntries.length === 0 && foodEntries.length === 0) {
            setNewIngredient({
              state: 'shown',
              source: 'new',
              value: {
                value: {
                  creator: auth.uid,
                  name: '',
                  valuesPer100g: {
                    energy: 0,
                    protein: 0,
                  },
                },
                weight: 0,
              },
            });

            return;
          }

          if (mealEntries.length === 0) {
            const [originalId, value] = foodEntries[0];
            setNewIngredient({
              state: 'shown',
              source: 'existing',
              value: {
                originalId,
                type: 'food',
                value,
                weight: 0,
              },
            });

            return;
          }

          const [originalId, value] = mealEntries[0];
          setNewIngredient({
            state: 'shown',
            source: 'existing',
            value: {
              originalId,
              type: 'meal',
              value,
              weight: 0,
            },
          });
        }}
      >
        <span>➕</span>
        &nbsp;
        <span className='btn-like-to-be-styled'>Add an ingredient...</span>
      </div>
    );
  }

  const generateNewIngredientsCard = () => {
    if (newIngredient.state === 'hidden') {
      return null;
    }

    const header = (
      <div
        className='flex-row flex-0'
        style={{
          marginTop: '-1rem',
          justifyContent: 'space-between',
        }}
      >
        <div
          style={{
            background: 'var(--bs-body-bg)',
            padding: '0 0.25rem',
            color: 'white',
          }}
        >
          <span>
          {
            newIngredient.value.value.name || 'New ingredient...'
          }
          </span>
        </div>

        {/* <div
          className='btn-like'
          style={{
            background: 'var(--bs-body-bg)',
            padding: '0 0.25rem',
          }}
          onClick={() => {
            setNewIngredient({
              state: 'hidden',
            });
          }}
        >
          <span className='btn-like-to-be-styled'>
            Cancel
          </span>
        </div> */}
      </div>
    );

    if (typeof meals === 'undefined' || typeof foods === 'undefined') {
      return null;
    }

    const mealEntries = Object.entries(meals).filter(([mealId]) => mealId !== initialMealId);
    const foodEntries = Object.entries(foods);

    return (
      <div
        className='card'
        style={{
          marginTop: '1rem',
          padding: '0.5rem',
          paddingTop: 0,
        }}
      >
        {header}

        <div
          className='flex flex-0'
          style={{
            marginTop: '0.25rem',
            padding: '0.25rem',
            paddingTop: 0,
          }}
        >
          <div className='flex-row form-mb'>
            <div className='flex-row flex-0' style={{ justifyContent: 'center', alignItems: 'center', whiteSpace: 'nowrap', marginRight: '1rem' }}>
              Source:
            </div>
            <div>
              <div>
                <label
                  style={{
                    textDecoration: mealEntries.length === 0 && foodEntries.length === 0 ? 'line-through' : undefined,
                  }}
                >
                  <input
                    type='radio'
                    checked={newIngredient.source === 'existing'}
                    disabled={mealEntries.length === 0 && foodEntries.length === 0}
                    onChange={(e) => {
                      // New -> Existing

                      if (mealEntries.length === 0 && foodEntries.length === 0) {
                        setNewIngredient({
                          state: 'shown',
                          source: 'new',
                          value: {
                            value: {
                              creator: auth.uid,
                              name: '',
                              valuesPer100g: {
                                energy: 0,
                                protein: 0,
                              },
                            },
                            weight: 0,
                          },
                        });

                        return;
                      }

                      if (mealEntries.length === 0) {
                        const [originalId, value] = foodEntries[0];
                        setNewIngredient({
                          state: 'shown',
                          source: 'existing',
                          value: {
                            originalId,
                            type: 'food',
                            value,
                            weight: 0,
                          },
                        });

                        return;
                      }

                      const [originalId, value] = mealEntries[0];
                      setNewIngredient({
                        state: 'shown',
                        source: 'existing',
                        value: {
                          originalId,
                          type: 'meal',
                          value,
                          weight: 0,
                        },
                      });
                    }}
                  />
                  &nbsp;
                  Existing
                </label>
              </div>
              <div>
                <label>
                  <input
                    type='radio'
                    checked={newIngredient.source === 'new'}
                    onChange={(e) => {
                      // Existing -> New

                      setNewIngredient({
                        state: 'shown',
                        source: 'new',
                        value: {
                          value: {
                            creator: auth.uid,
                            name: '',
                            valuesPer100g: {
                              energy: 0,
                              protein: 0,
                            },
                          },
                          weight: 0,
                        },
                      });
                    }}
                  />
                  &nbsp;
                  New
                </label>
              </div>
            </div>
          </div>
          {
            newIngredient.source === 'existing' && (
              <div className='flex-row form-mb'>
                <div className='flex-row flex-0' style={{ justifyContent: 'center', alignItems: 'center', whiteSpace: 'nowrap', marginRight: '1rem' }}>
                  Template:
                </div>
                <div className='flex-row'>
                  <select
                    className='form-select'
                    value={newIngredient.value.type + '-' + newIngredient.value.originalId}
                    onChange={(e) => {
                      // e.target.value: meal-id or food-id
                      const [type, originalId] = e.target.value.split('-') as ['food' | 'meal', string];
                      const value = type === 'food' ? foods[originalId] : meals[originalId];
                      setNewIngredient({
                        state: 'shown',
                        source: 'existing',
                        value: {
                          originalId,
                          type,
                          value,
                          weight: 0,
                        },
                      });
                    }}
                  >
                    {
                      mealEntries.map(([id, value]) => {
                        return (
                          <option
                            key={`meal-${id}`}
                            value={`meal-${id}`}
                            label={value.name}
                          />
                        );
                      })
                    }

                    {
                      foodEntries.map(([id, value]) => {
                        return (
                          <option
                            key={`food-${id}`}
                            value={`food-${id}`}
                            label={value.name}
                          />
                        );
                      })
                    }
                  </select>
                </div>
              </div>
            )
          }
          <div className='flex-row form-mb'>
            <div className='flex-row flex-0' style={{ justifyContent: 'center', alignItems: 'center', whiteSpace: 'nowrap', marginRight: '1rem' }}>
              Name:
            </div>
            <div className='flex-row'>
              <input
                className='form-control'
                type='text'
                required
                value={newIngredient.value.value.name}
                onChange={(e) => {
                  /// @ts-ignore
                  setNewIngredient({
                    ...newIngredient,
                    value: {
                      ...newIngredient.value,
                      value: {
                        ...newIngredient.value.value,
                        name: e.target.value,
                      },
                    },
                  })
                }}
              />
            </div>
          </div>
          <div className='flex-row form-mb'>
            <div className='flex-row flex-0' style={{ justifyContent: 'center', alignItems: 'center', whiteSpace: 'nowrap', marginRight: '1rem' }}>
              Energy (kcal/100g):
            </div>
            <div className='flex-row'>
              <input
                className='form-control'
                type='number'
                step='any'
                value={newIngredient.value.value.valuesPer100g.energy}
                onChange={(e) => {
                  /// @ts-ignore
                  setNewIngredient({
                    ...newIngredient,
                    value: {
                      ...newIngredient.value,
                      value: {
                        ...newIngredient.value.value,
                        valuesPer100g: {
                          ...newIngredient.value.value.valuesPer100g,
                          energy: parseFloat(e.target.value),
                        },
                      },
                    },
                  })
                }}
              />
            </div>
          </div>
          <div className='flex-row form-mb'>
            <div className='flex-row flex-0' style={{ justifyContent: 'center', alignItems: 'center', whiteSpace: 'nowrap', marginRight: '1rem' }}>
              Protein (%):
            </div>
            <div className='flex-row'>
              <input
                className='form-control'
                type='number'
                step='any'
                value={newIngredient.value.value.valuesPer100g.protein}
                onChange={(e) => {
                  /// @ts-ignore
                  setNewIngredient({
                    ...newIngredient,
                    value: {
                      ...newIngredient.value,
                      value: {
                        ...newIngredient.value.value,
                        valuesPer100g: {
                          ...newIngredient.value.value.valuesPer100g,
                          protein: parseFloat(e.target.value),
                        },
                      },
                    },
                  })
                }}
              />
            </div>
          </div>
          <div className='flex-row form-mb'>
            <div className='flex-row flex-0' style={{ justifyContent: 'center', alignItems: 'center', whiteSpace: 'nowrap', marginRight: '1rem' }}>
              Weight (g):
            </div>
            <div className='flex-row'>
              <input
                className='form-control'
                type='number'
                step='any'
                value={newIngredient.value.weight}
                onChange={(e) => {
                  /// @ts-ignore
                  setNewIngredient({
                    ...newIngredient,
                    value: {
                      ...newIngredient.value,
                      weight: parseFloat(e.target.value),
                    },
                  })
                }}
              />
            </div>
          </div>
          <button
            className='btn btn-primary form-mb'
            type='button'
            disabled={newIngredient.state === 'adding'}
            onClick={async () => {
              // If new, create this as a new food.
              let newFoodId: string | undefined = undefined;
              if (newIngredient.source === 'new') {
                setNewIngredient({
                  ...newIngredient,

                  /// @ts-ignore
                  state: 'adding',
                });

                try {
                  const result = await addDoc(collection(db, 'foods'), newIngredient.value.value);
                  newFoodId = result.id;
                } catch (err: any) {
                  alert(err.message);

                  setNewIngredient({
                    state: 'hidden',
                  });

                  return;
                }
              }

              let ingredientToAdd: Ingredient;
              if (newFoodId) {
                ingredientToAdd = {
                  originalId: newFoodId,
                  type: 'food',
                  ...newIngredient.value,
                };
              } else {
                ingredientToAdd = newIngredient.value as Ingredient;
              }

              const ingredients = [
                ...meal.ingredients,
                ingredientToAdd,
              ];

              // Calculate new values
              let totalWeight: number = 0;
              let values: NutritionalValues = {
                energy: 0,
                protein: 0,
              };

              for (const ingredient of ingredients) {
                totalWeight += ingredient.weight;
                values.energy += ingredient.value.valuesPer100g.energy * (ingredient.weight / 100);
                values.protein += ingredient.value.valuesPer100g.protein * (ingredient.weight / 100);
              }

              const valuesPer100g: NutritionalValues = {
                energy: values.energy / (totalWeight / 100),
                protein: values.protein / (totalWeight / 100),
              };

              const newMeal = {
                ...meal,
                ingredients,
                values,
                valuesPer100g,
              };

              setMeal(newMeal);

              console.log(newMeal);

              setNewIngredient({
                state: 'hidden',
              });
            }}
          >
            {
              newIngredient.state === 'shown' ?
                'Save' :
                'Loading...'
            }
          </button>
          <button
            className='btn btn-secondary'
            type='button'
            onClick={() => {
              setNewIngredient({
                state: 'hidden',
              });
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    );



  }

  const ingredientsCard = (
    <div
      className='card flex form-mb'
      style={{
        textAlign: 'left',
        marginTop: '0.75rem',
        padding: '0.5rem',
        paddingTop: 0,
      }}
    >
      <div
        style={{
          marginTop: '-1rem',
        }}
      >
        <span
          style={{
            background: 'var(--bs-body-bg)',
            padding: '0 0.25rem',
          }}
        >
          Ingredients:
        </span>
      </div>
      {
        meal.ingredients.length > 0 &&
        <div>
          {
            meal.ingredients.map((ingredient) => {
              return (
                <div key={ingredient.originalId}>
                  <div
                    className='flex-row'
                  >
                    <div
                      className='btn-like'
                      style={{
                        color: 'white',
                        padding: '0.5rem 0',
                        cursor: 'pointer',
                        display: 'inline-block',
                      }}
                      onClick={() => {

                      }}
                    >
                      <span>✏️</span>
                    </div>
                    <div className='flex-row flex-0' style={{ justifyContent: 'center', alignItems: 'center', whiteSpace: 'nowrap', margin: '0 0.25rem' }}>
                      {`${ingredient.value.name} (${ingredient.weight}g)`}
                    </div>
                    <div
                      className='btn-like'
                      style={{
                        color: 'white',
                        padding: '0.5rem 0',
                        cursor: 'pointer',
                        display: 'inline-block',
                      }}
                      onClick={() => {

                      }}
                    >
                      <span>🗑️</span>
                    </div>
                  </div>
                </div>
              );
            })
          }
        </div>
      }

      {
        newIngredient.state === 'hidden' ?
          generateAddAnIngredientButton() :
          generateNewIngredientsCard()
      }
    </div>
  );

  const submitButton = (
    <button
      className='btn btn-primary form-mb'
      type='submit'
      disabled={isSubmitting}
    >
      {
        !isSubmitting ?
          'Submit' :
          'Loading...'
      }
    </button>
  );

  const cancelButton = (
    <button
      className='btn btn-secondary'
      type='button'
      disabled={isSubmitting}
      onClick={() => {
        setModalState('fade-out');
      }}
    >
      Cancel
    </button>
  );

  const onSubmit = async () => {
    try {
      setSubmitting(true);
      if (!initialMealId) {
        await addDoc(collection(db, 'meals'), meal);
      } else {
        await updateDoc(doc(db, 'meals', initialMealId), meal);
      }

      setModalState('fade-out');
      setNewIngredient({ state: 'hidden' });
    } catch (err: any) {
      alert(err.message);
    }

    setSubmitting(false);
  }

  return (
    <Modal
      modalState={modalState}
      setModalState={setModalState}
      onHide={() => {
        if (onHide) {
          onHide();
        }

        setMeal(generateDefaultMeal(auth.uid));
        setNewIngredient({ state: 'hidden' });
      }}
    >
      <div
        className='card flex'
      >
        <form
          className='flex'
          onSubmit={async (e) => {
            e.preventDefault();
            await onSubmit();
          }}
        >
          <div
            className='flex'
            style={{
              padding: '1rem',
              textAlign: 'center',
            }}
          >
            <h3>
              {isNew ? 'Add a meal' : 'Edit meal'}
            </h3>
            <div
              className='flex flex-0'
              style={{
                margin: '1rem',
              }}
            >
              <div className='flex-row form-mb'>
                <div className='flex-row flex-0' style={{ justifyContent: 'center', alignItems: 'center', whiteSpace: 'nowrap', marginRight: '1rem' }}>
                  Name:
                </div>
                <div className='flex-row'>
                  <input
                    className='form-control'
                    type='text'
                    required
                    value={meal.name}
                    onChange={(e) => setMeal({ ...meal, name: e.target.value })}
                  />
                </div>
              </div>

              {ingredientsCard}

              <div className='flex-row form-mb'>
                <div className='flex-row flex-0' style={{ justifyContent: 'center', alignItems: 'center', whiteSpace: 'nowrap', marginRight: '1rem' }}>
                  Energy (kcal):
                </div>
                <div className='flex-row'>
                  <input
                    className='form-control'
                    type='number'
                    readOnly
                    value={meal.values.energy}
                  />
                </div>
              </div>

              <div className='flex-row form-mb'>
                <div className='flex-row flex-0' style={{ justifyContent: 'center', alignItems: 'center', whiteSpace: 'nowrap', marginRight: '1rem' }}>
                  Protein (g):
                </div>
                <div className='flex-row'>
                  <input
                    className='form-control'
                    type='number'
                    readOnly
                    value={meal.values.protein}
                  />
                </div>
              </div>

              {submitButton}
              {cancelButton}
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
}

const generateDefaultMeal = (uid: string) => {
  return {
    name: '',
    creator: uid,
    values: {
      energy: 0,
      protein: 0,
    },
    valuesPer100g: {
      energy: 0,
      protein: 0,
    },
    ingredients: [],
  };
}