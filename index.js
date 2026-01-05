// CT-BottomMesButtons - Moves message buttons to the bottom of messages
(function () {
  const MODULE_NAME = "CT-BottomMesButtons";

  /**
   * Moves the buttons in a message element to the bottom
   * @param {HTMLElement} mesElement - The .mes element to process
   */
  function moveButtonsToBottom(mesElement) {
    const mesBlock = mesElement.querySelector(".mes_block");
    if (!mesBlock) return;

    const mesButtons = mesBlock.querySelector(".ch_name > .mes_buttons");
    const mesEditButtons = mesBlock.querySelector(
      ".ch_name > .mes_edit_buttons"
    );
    const mesBias = mesBlock.querySelector(".mes_bias");

    if (!mesBias) return;

    // Move .mes_buttons after .mes_bias
    if (mesButtons && !mesBlock.querySelector(".mes_bias + .mes_buttons")) {
      mesBias.after(mesButtons);
    }

    // Move .mes_edit_buttons after .mes_buttons
    if (mesEditButtons) {
      const movedMesButtons = mesBlock.querySelector(
        ".mes_bias + .mes_buttons"
      );
      if (
        movedMesButtons &&
        !mesBlock.querySelector(".mes_buttons + .mes_edit_buttons")
      ) {
        movedMesButtons.after(mesEditButtons);
      }
    }

    // Move .mes_edit button inside .extraMesButtons (after .mes_copy)
    const extraMesButtons = mesElement.querySelector(".extraMesButtons");
    const mesEditOutside = mesElement.querySelector(".mes_buttons > .mes_edit");
    const mesCopy = extraMesButtons?.querySelector(".mes_copy");

    if (extraMesButtons && mesEditOutside && mesCopy) {
      // Check if mes_edit is not already inside extraMesButtons
      if (!extraMesButtons.querySelector(".mes_edit")) {
        mesCopy.after(mesEditOutside);
      }
    }
  }

  /**
   * Process all existing messages
   */
  function processAllMessages() {
    document.querySelectorAll("#chat .mes").forEach(moveButtonsToBottom);
  }

  /**
   * Initialize the extension
   */
  function init() {
    console.log(`[${MODULE_NAME}] Initializing...`);

    // Process existing messages
    processAllMessages();

    // Observe for new messages being added
    const chat = document.getElementById("chat");
    if (chat) {
      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          for (const node of mutation.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (node.classList?.contains("mes")) {
                moveButtonsToBottom(node);
              }
              // Also check children in case a container was added
              node.querySelectorAll?.(".mes").forEach(moveButtonsToBottom);
            }
          }
        }
      });

      observer.observe(chat, { childList: true, subtree: true });
    }

    // Listen for chat changes using SillyTavern's event system
    const context = SillyTavern.getContext();
    if (context?.eventSource && context?.event_types) {
      context.eventSource.on(context.event_types.CHAT_CHANGED, () => {
        // Small delay to ensure DOM is updated
        setTimeout(processAllMessages, 100);
      });

      context.eventSource.on(
        context.event_types.CHARACTER_MESSAGE_RENDERED,
        () => {
          setTimeout(processAllMessages, 50);
        }
      );

      context.eventSource.on(context.event_types.USER_MESSAGE_RENDERED, () => {
        setTimeout(processAllMessages, 50);
      });
    }

    console.log(`[${MODULE_NAME}] Initialized successfully`);
  }

  // Wait for jQuery and DOM to be ready
  if (typeof jQuery !== "undefined") {
    jQuery(init);
  } else {
    document.addEventListener("DOMContentLoaded", init);
  }
})();
