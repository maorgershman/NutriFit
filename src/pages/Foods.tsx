import { FormEvent, useContext, useEffect, useRef, useState } from 'react';
import { addDoc, collection, deleteDoc, doc, getFirestore, onSnapshot, orderBy, query, updateDoc, where } from 'firebase/firestore';
import { Context } from '../Context';
import { getFormValue, setFormValue } from '../utils';

type Item = Food;
type ItemDict = {
  [key: string]: Item
};
type ItemEditDict = {
  [key: string]: boolean
};

const db = getFirestore();
export const Foods = () => {
  const ctx = useContext(Context);
  const auth = ctx.auth!;

  const [items, setItems] = useState<ItemDict>();
  const [itemsEditing, setItemsEditing] = useState<ItemEditDict>({});

  const tableRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
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
      valuesPer100g: {
        energy: parseFloat(getFormValue('energy', e)),
        protein: parseFloat(getFormValue('protein', e)),
      },
    } as Item;

    setFormValue('name', '', e);
    setFormValue('energy', 0, e);
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
      valuesPer100g: {
        energy: parseFloat(getFormValue('energy', e)),
        protein: parseFloat(getFormValue('protein', e)),
      },
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
    if (!items) {
      console.error('resetItem failed: items is undefined!');
      return;
    }

    const item = items[itemId];

    setFormValue('name', item.name, e);
    setFormValue('energy', item.valuesPer100g.energy, e);
    setFormValue('protein', item.valuesPer100g.protein, e);

    setItemsEditing({
      ...itemsEditing,
      [itemId]: false,
    });
  }

  return (
    <>
      <h1>Foods</h1>
      <div
        className='container card'
      >
        <div
          className='table-responsive flex'
          style={{
            margin: '0.5rem',
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
                <th>Energy (kcal/100g)</th>
                <th>Protein (%)</th>
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
                    required
                  />
                </td>
                <td>
                  <input
                    className='form-control'
                    form='new-item'
                    type='number'
                    step='any'
                    name='energy'
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
                            required
                          />
                        </td>
                        <td>
                          <input
                            className='form-control'
                            form={'edit-' + itemId}
                            type='number'
                            step='any'
                            name='energy'
                            defaultValue={item.valuesPer100g.energy}
                          />
                        </td>
                        <td>
                          <input
                            className='form-control'
                            form={'edit-' + itemId}
                            type='number'
                            step='any'
                            name='protein'
                            defaultValue={item.valuesPer100g.protein}
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
                      <td>{item.valuesPer100g.energy}</td>
                      <td>{item.valuesPer100g.protein}</td>
                      <td>
                        <button
                          className='btn'
                          type='button'
                          onClick={() => {
                            setItemsEditing({
                              ...itemsEditing,
                              [itemId]: true,
                            });
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
    </>
  );
}