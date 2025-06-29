// Shared in-memory data store (replace with database in production)
export const uploadHistory: any[] = []

export function addUpload(upload: any) {
  uploadHistory.unshift(upload)
  // Keep only last 50 uploads in memory
  if (uploadHistory.length > 50) {
    uploadHistory.splice(50)
  }
}

export function getUploadHistory(userId?: string, limit?: number) {
  let filtered = uploadHistory
  if (userId) {
    filtered = uploadHistory.filter(upload => upload.userId === userId)
  }
  if (limit) {
    filtered = filtered.slice(0, limit)
  }
  return filtered
} 