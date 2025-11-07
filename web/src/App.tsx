import "./App.css";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { store, persistor } from "./store";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";


function App() {
  return (
    <Provider store={store}>
      <PersistGate
        onBeforeLift={() => {
          console.log("Rehydrated auth:", store.getState().auth);
        }}
        loading={null}
        persistor={persistor}
      >
        <RouterProvider router={router} />
      </PersistGate>
    </Provider>
  );
}

export default App;
