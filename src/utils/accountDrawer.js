import { ref } from 'vue'

// Shared open state for the account settings drawer rendered in the header.
export const accountDrawerVisible = ref(false)

export function openAccountSettings () {
  accountDrawerVisible.value = true
}
