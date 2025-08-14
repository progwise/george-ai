export const canAccessListOrThrow = (
  list: { ownerId: string; participants: { userId: string }[] },
  user: { id: string },
) => {
  if (list.ownerId === user.id) {
    return true
  }
  if (list.participants.some((participation) => participation.userId === user.id)) {
    return true
  }
  throw new Error(`User ${user.id} can not access list`)
}
