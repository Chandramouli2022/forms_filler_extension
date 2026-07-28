let activeInput = null;

document.addEventListener("focusin", (event) => {

    const el = event.target;

    if (
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        el.isContentEditable
    ) {
        activeInput = el;
    }

}, true);

document.addEventListener("mousedown", (event) => {

    const el = event.target;

    if (
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        el.isContentEditable
    ) {
        activeInput = el;
    }

}, true);


function prettify(key) {

    return key

        .replace(/([A-Z])/g, " $1")

        .replace(/^./, c => c.toUpperCase());

}

function createFloatingPanel(profile) {

    // Prevent duplicate panel
    if (document.getElementById("quick-fill-host"))
        return;

    // Host element
    const host = document.createElement("div");
    host.id = "quick-fill-host";
    document.body.appendChild(host);

    // Shadow Root
    const shadow = host.attachShadow({ mode: "open" });

    // CSS
    const style = document.createElement("style");
    style.textContent = `
        #quick-fill-panel {
            position: fixed;
            top: 70px;
            right: 20px;
            width: 230px;
            background: #ffffff;
            border-radius: 10px;
            box-shadow: 0 6px 20px rgba(0,0,0,.25);
            font-family: Arial, sans-serif;
            z-index: 2147483647;
            overflow: hidden;
        }

        #quick-fill-header {
            background: #0077b5;
            color: white;
            padding: 10px;
            font-weight: bold;
            cursor: move;
            display: flex;
            justify-content: space-between;
            align-items: center;
            user-select: none;
        }

        #quick-fill-body {
            max-height: 450px;
            overflow-y: auto;
            padding: 10px;
        }

        .quick-fill-button {
            width: 100%;
            margin-bottom: 8px;
            padding: 8px;
            border: none;
            border-radius: 5px;
            background: rgb(182 103 103) !important;
            cursor: pointer;
            transition: .2s;
            font-size: 14px;
        }

        .quick-fill-button:hover {
            background: #0077b5;
            color: white;
        }

        #quick-fill-close {
            cursor: pointer;
            font-size: 18px;
        }
    `;

    shadow.appendChild(style);

    // Panel
    const panel = document.createElement("div");
    panel.id = "quick-fill-panel";

    panel.innerHTML = `
        <div id="quick-fill-header">
            <span>🚀 Quick Fill</span>
            <span id="quick-fill-close">✖</span>
        </div>

        <div id="quick-fill-body"></div>
    `;

    shadow.appendChild(panel);

    const body = panel.querySelector("#quick-fill-body");

    Object.entries(profile).forEach(([key, value]) => {

        const button = document.createElement("button");

        button.className = "quick-fill-button";
        button.textContent = prettify(key);

        button.addEventListener("click", async (e) => {

            if (e.ctrlKey) {

                const text = Array.isArray(value)
                    ? value.join(", ")
                    : String(value);

                await navigator.clipboard.writeText(text);

                console.log(`${key} copied`);

                return;
            }

            if (!activeInput) {

                alert("Click an input field first.");

                return;
            }

            if (key === "skillsData" && Array.isArray(value)) {

                for (const skill of value) {

                    fillValue(skill);

                    Utils.triggerEnter(activeInput);

                    await Utils.sleep(600);
                }

                return;
            }

            fillValue(String(value));
        });

        button.addEventListener("mousedown", (e) => {
            e.preventDefault();
        });

        body.appendChild(button);
    });

    panel.querySelector("#quick-fill-close").onclick = () => {
        host.remove();
    };

    makeDraggable(panel);
}

function fillValue(value) {

    if (!activeInput)
        return;

    activeInput.focus();

    if (
        activeInput instanceof HTMLInputElement ||
        activeInput instanceof HTMLTextAreaElement
    ) {

        const prototype =
            activeInput instanceof HTMLTextAreaElement
                ? HTMLTextAreaElement.prototype
                : HTMLInputElement.prototype;

        const setter = Object.getOwnPropertyDescriptor(
            prototype,
            "value"
        )?.set;

        if (setter) {
            setter.call(activeInput, value);
        } else {
            activeInput.value = value;
        }

        activeInput.dispatchEvent(
            new Event("input", { bubbles: true })
        );

        activeInput.dispatchEvent(
            new Event("change", { bubbles: true })
        );

    }
    else if (activeInput.isContentEditable) {

        activeInput.innerText = value;

        activeInput.dispatchEvent(
            new Event("input", { bubbles: true })
        );

    }

}

function makeDraggable(panel) {

    const header = panel.querySelector("#quick-fill-header");

    let x = 0;
    let y = 0;

    let mouseX = 0;
    let mouseY = 0;

    header.onmousedown = dragMouseDown;

    function dragMouseDown(e) {

        e.preventDefault();

        mouseX = e.clientX;

        mouseY = e.clientY;

        document.onmouseup = closeDrag;

        document.onmousemove = drag;

    }

    function drag(e) {

        e.preventDefault();

        x = mouseX - e.clientX;

        y = mouseY - e.clientY;

        mouseX = e.clientX;

        mouseY = e.clientY;

        panel.style.top = (panel.offsetTop - y) + "px";

        panel.style.left = (panel.offsetLeft - x) + "px";

        panel.style.right = "auto";

    }

    function closeDrag() {

        document.onmouseup = null;

        document.onmousemove = null;

    }

}

function togglePanel() {

    const panel = document.getElementById("quick-fill-panel");

    if (!panel)
        return;

    panel.style.display =
        panel.style.display === "none"
            ? "block"
            : "none";

}

chrome.runtime.onMessage.addListener(async (message) => {

    if (message.action !== "toggleAutofillPanel")
        return;

    let panel = document.getElementById("quick-fill-panel");

    if (!panel) {

        const profile = await ProfileLoader.load();

        createFloatingPanel(profile);

        panel = document.getElementById("quick-fill-panel");

    }

    togglePanel();

});