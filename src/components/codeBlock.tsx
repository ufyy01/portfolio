import { PrismLight } from "react-syntax-highlighter";
import javascript from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import vscDarkPlus from "react-syntax-highlighter/dist/esm/styles/prism/vsc-dark-plus";

/**
 * The one highlighter the two "how it works" drawers share.
 *
 * `Prism` — the default export — arrives with all 280-odd refractor grammars
 * attached, which is 640KB of Erlang and Verilog and BNF for two snippets of
 * javascript. `PrismLight` starts empty and gets told what it needs, and the
 * theme is imported from its own file so the styles barrel does not bring every
 * other theme along with it.
 */
PrismLight.registerLanguage("javascript", javascript);

const CodeBlock = ({ children }: { children: string }) => (
	<PrismLight language="javascript" style={vscDarkPlus}>
		{children}
	</PrismLight>
);

export default CodeBlock;
