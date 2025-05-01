import React from 'react'

const UserModal = ({user , closeModal}) => {
    const isEdit = !!user;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">{isEdit ? 'Edit User' : 'Add New User'}</h3>
          </div>
          <div className="p-6">
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input 
                  type="text" 
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  defaultValue={user?.name || ''}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input 
                  type="email" 
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  defaultValue={user?.email || ''}
                />
              </div>
              {!isEdit && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input 
                    type="password" 
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <select 
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  defaultValue={user?.role || 'Member'}
                >
                  <option value="Member">Member</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </form>
          </div>
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <button 
              onClick={closeModal}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button 
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isEdit ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </div>
    );
  }
  

export default UserModal
