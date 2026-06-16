import KeystaticApp from "./keystatic";
import KeystaticErrorSuppressor from "./ErrorSuppressor";

export default function Layout() {
  return (
    <div className="pt-[100px] max-[810px]:pt-[80px] min-h-screen bg-bg-dark">
      <KeystaticErrorSuppressor>
        <KeystaticApp />
      </KeystaticErrorSuppressor>
    </div>
  );
}
