import { Provider } from "react-redux";
import { RouterProvider } from "react-router";
import { store } from "./app/store";
// import { router } from "./app/router";
import {router} from "./app/router"
import "./index.css"

function App() {
  return (
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  );
}

export default App;