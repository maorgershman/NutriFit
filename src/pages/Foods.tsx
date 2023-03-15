import { FormEvent, useContext, useEffect, useState } from 'react';
import { addDoc, collection, deleteDoc, doc, getCountFromServer, getDocs, getFirestore, limit, onSnapshot, orderBy, query, setDoc, startAfter, startAt, updateDoc, where } from 'firebase/firestore';
import { Context } from '../Context';

const RESULTS_PER_PAGE = 5;
type Food = {
  creator: string,
  name: string,
  kcal: number,
  protein: number,
}

type Item = Food;
type ItemDict = {
  [key: string]: Item
};
type ItemEditDict = {
  [key: string]: boolean
};

const getFormValue = (name: string, e: FormEvent<HTMLFormElement>) => {
  const target = e.target as any;
  return target[name].value;
}

const setFormValue = (name: string, value: any, e: FormEvent<HTMLFormElement>) => {
  const target = e.target as any;
  target[name].value = value;
}

const db = getFirestore();
export const Foods = () => {
  const ctx = useContext(Context);
  const auth = ctx.auth!;

  const [items, setItems] = useState<ItemDict>({});
  const [itemsEditing, setItemsEditing] = useState<ItemEditDict>({});

  useEffect(() => {
    console.log('Foods subscribed');

    console.log('uid', auth.uid);
    const unsubscribe = onSnapshot(query(
      collection(db, 'foods'),
      where('creator', '==', auth.uid),
      orderBy('name'),
    ), async (querySnapshot) => {
      const newItems = {} as ItemDict;
      const newItemsEditing = { ...itemsEditing };

      var newItemsEditingKeys = Object.keys(newItemsEditing);
      querySnapshot.forEach((itemObj) => {
        const itemId = itemObj.id;
        const item = itemObj.data() as Item;

        newItems[itemId] = item;
        if (!(itemId in newItemsEditingKeys)) {
          newItemsEditing[itemId] = false;
        } else {
          delete newItemsEditing[itemId];
        }
      });

      setItems(newItems);
      setItemsEditing(newItemsEditing);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const addNewItem = async (e: FormEvent<HTMLFormElement>) => {
    const item = {
      name: getFormValue('name', e),
      creator: auth.uid,
      kcal: getFormValue('kcal', e),
      protein: getFormValue('protein', e),
    } as Item;
    
    setFormValue('name', '', e);
    setFormValue('kcal', 0, e);
    setFormValue('protein', 0, e);

    try {
      await addDoc(collection(db, 'foods'), item);
    } catch (err: any) {
      alert(err.message);
    }
  }

  const deleteItem = async (itemId: string) => {
    const sure = window.confirm('Are you sure?');
    if (!sure) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'foods', itemId));
    } catch (err: any) {
      alert(err.message);
    }
  }

  const saveItem = async (itemId: string, e: FormEvent<HTMLFormElement>) => {
    const item = {
      name: getFormValue('name', e),
      creator: auth.uid,
      kcal: getFormValue('kcal', e),
      protein: getFormValue('protein', e),
    } as Item;

    setItemsEditing({
      ...itemsEditing,
      [itemId]: false,
    });

    try {
      await updateDoc(doc(db, 'foods', itemId), item);
    } catch (err: any) {
      alert(err.message);
    }
  }

  const resetItem = async (itemId: string, e: FormEvent<HTMLFormElement>) => {
    const item = items[itemId];

    setFormValue('name', item.name, e);
    setFormValue('kcal', item.kcal, e);
    setFormValue('protein', item.protein, e);
    
    setItemsEditing({
      ...itemsEditing,
      [itemId]: false,
    });
  }

  return (
    <>
      <h1>Foods</h1>
      <div
        className='container card flex-1'
      >
        <div
          className='table-responsive flex'
          style={{
            margin: '0.5rem'
          }}
        >
          <form
            id='new-item'
            onSubmit={(e) => {
              e.preventDefault();
              addNewItem(e);
            }}
          />

          {
            Object.entries(itemsEditing).map(([itemId, isEditing]) => {
              if (!isEditing) {
                return null;
              }

              return (
                <form
                  key={itemId}
                  id={'edit-' + itemId}
                  onSubmit={(e) => {
                    e.preventDefault();
                    saveItem(itemId, e);
                  }}
                  onReset={(e) => {
                    e.preventDefault();
                    resetItem(itemId, e);
                  }}
                />
              );
            })
          }

          <table
            className='table align-middle'
          >
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>kCalories (/100g)</th>
                <th>% of Protein</th>
                <th></th>
                <th></th>
              </tr>
              <tr>
                <td></td>
                <td>
                  <input
                    className='form-control'
                    form='new-item'
                    type='text'
                    name='name'
                  />
                </td>
                <td>
                  <input
                    className='form-control'
                    form='new-item'
                    type='number'
                    step='any'
                    name='kcal'
                    defaultValue={0}
                  />
                </td>
                <td>
                  <input
                    className='form-control'
                    form='new-item'
                    type='number'
                    step='any'
                    name='protein'
                    defaultValue={0}
                  />
                </td>
                <td>
                  <button
                    className='btn'
                    form='new-item'
                    type='submit'
                  >
                    ➕
                  </button>
                </td>
                <td></td>
              </tr>
            </thead>
            <tbody>
              {
                Object.entries(items).map(([itemId, item], index) => {
                  if (itemsEditing[itemId]) {
                    return (
                      <tr key={'edit-' + itemId}>
                        <td>{index + 1}.</td>
                        <td>
                          <input
                            className='form-control'
                            form={'edit-' + itemId}
                            type='text'
                            name='name'
                            defaultValue={item.name}
                          />
                        </td>
                        <td>
                          <input
                            className='form-control'
                            form={'edit-' + itemId}
                            type='number'
                            step='any'
                            name='kcal'
                            defaultValue={item.kcal}
                          />
                        </td>
                        <td>
                          <input
                            className='form-control'
                            form={'edit-' + itemId}
                            type='number'
                            step='any'
                            name='protein'
                            defaultValue={item.protein}
                          />
                        </td>
                        <td>
                          <button
                            className='btn'
                            form={'edit-' + itemId}
                            type='reset'
                          >
                            ❌
                          </button>
                        </td>
                        <td>
                          <button
                            className='btn'
                            form={'edit-' + itemId}
                            type='submit'
                          >
                            ✔️
                          </button>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={itemId}>
                      <td>{index + 1}.</td>
                      <td>{item.name}</td>
                      <td>{item.kcal}</td>
                      <td>{item.protein}</td>
                      <td>
                        <button
                          className='btn'
                          type='button'
                          onClick={() => {
                            const newItemsEditing = {
                              ...itemsEditing,
                              [itemId]: true,
                            };
                            setItemsEditing(newItemsEditing);
                          }}
                        >
                          ✏️
                        </button>
                      </td>
                      <td>
                        <button
                          className='btn'
                          type='button'
                          onClick={() => deleteItem(itemId)}
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
    </>
  );
}