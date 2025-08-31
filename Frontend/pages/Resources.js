// C:\Users\aanus\Desktop\Maximally AI Shipathon\Frontend\pages\Resources.js
function Resources({ user }) {
  try {
    const [resources, setResources] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [showUploadForm, setShowUploadForm] = React.useState(false);
    const [newResource, setNewResource] = React.useState({
      title: '',
      type: 'PDF',
      category: '',
      description: '',
      url: ''
    });

    React.useEffect(() => {
      fetchResources();
    }, [user]);

    const fetchResources = async () => {
      try {
        setLoading(true);
        const resourceData = await window.apiUtils.getResources();
        setResources(resourceData || []);
      } catch (error) {
        console.error('Error fetching resources:', error);
        setResources([]);
      } finally {
        setLoading(false);
      }
    };

    const handleUploadResource = async (e) => {
      e.preventDefault();
      try {
        const resourceId = `resource_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const resourceData = {
          ...newResource,
          id: resourceId,
          uploadedBy: user.uid,
          uploaderName: user.displayName,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        await window.firestore.collection('resources').doc(resourceId).set(resourceData);
        
        setShowUploadForm(false);
        setNewResource({
          title: '',
          type: 'PDF',
          category: '',
          description: '',
          url: ''
        });
        
        await fetchResources();
        
        window.notificationUtils.addNotification({
          type: 'resource',
          title: 'Resource Uploaded!',
          message: `You shared "${newResource.title}"`,
          time: 'Just now'
        });
      } catch (error) {
        console.error('Error uploading resource:', error);
      }
    };

    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-[var(--primary-color)] border-t-transparent rounded-full"></div>
        </div>
      );
    }

    return (
      <div className="space-y-6" data-name="resources" data-file="pages/Resources.js">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">Digital Library</h2>
            <p className="text-[var(--text-secondary)]">Access and share learning materials</p>
          </div>
          <button 
            onClick={() => setShowUploadForm(true)}
            className="btn btn-primary"
          >
            <div className="icon-upload text-lg mr-2"></div>
            Share Resource
          </button>
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <select className="input-field w-auto">
            <option>All Categories</option>
            <option>Programming</option>
            <option>Design</option>
            <option>Data Science</option>
            <option>Mobile Development</option>
          </select>
          <select className="input-field w-auto">
            <option>All Types</option>
            <option>PDF</option>
            <option>Video</option>
            <option>Article</option>
            <option>Link</option>
          </select>
        </div>

        {showUploadForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Share New Resource</h3>
              <form onSubmit={handleUploadResource} className="space-y-4">
                <input
                  type="text"
                  placeholder="Resource Title"
                  value={newResource.title}
                  onChange={(e) => setNewResource(prev => ({ ...prev, title: e.target.value }))}
                  className="input-field"
                  required
                />
                <select
                  value={newResource.type}
                  onChange={(e) => setNewResource(prev => ({ ...prev, type: e.target.value }))}
                  className="input-field"
                >
                  <option value="PDF">PDF Document</option>
                  <option value="Video">Video Tutorial</option>
                  <option value="Article">Article</option>
                  <option value="Link">External Link</option>
                </select>
                <input
                  type="text"
                  placeholder="Category"
                  value={newResource.category}
                  onChange={(e) => setNewResource(prev => ({ ...prev, category: e.target.value }))}
                  className="input-field"
                  required
                />
                <textarea
                  placeholder="Description"
                  value={newResource.description}
                  onChange={(e) => setNewResource(prev => ({ ...prev, description: e.target.value }))}
                  className="input-field h-20"
                />
                <input
                  type="url"
                  placeholder="Resource URL (optional)"
                  value={newResource.url}
                  onChange={(e) => setNewResource(prev => ({ ...prev, url: e.target.value }))}
                  className="input-field"
                />
                <div className="flex space-x-2">
                  <button type="submit" className="flex-1 btn btn-primary">Share Resource</button>
                  <button 
                    type="button" 
                    onClick={() => setShowUploadForm(false)}
                    className="flex-1 btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {resources.length === 0 ? (
          <div className="text-center py-12">
            <div className="icon-folder text-4xl text-[var(--text-secondary)] mb-4"></div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Library is Empty</h3>
            <p className="text-[var(--text-secondary)] mb-4">Be the first to share a learning resource!</p>
            <button
              onClick={() => setShowUploadForm(true)}
              className="btn btn-primary"
            >
              Share First Resource
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {resources.map((resource) => (
              <div key={resource.id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <div className={`icon-${resource.type === 'PDF' ? 'file-text' : resource.type === 'Video' ? 'play' : 'link'} text-xl text-blue-600`}></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[var(--text-primary)] mb-1">{resource.title}</h3>
                    <p className="text-sm text-[var(--text-secondary)] mb-2">{resource.category}</p>
                    <div className="flex items-center text-xs text-[var(--text-secondary)]">
                      <span className="bg-gray-100 px-2 py-1 rounded mr-2">{resource.type}</span>
                      <span>{resource.size || resource.duration}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2 mt-4">
                  <button className="flex-1 btn btn-primary text-sm">
                    <div className="icon-download text-sm mr-1"></div>
                    Access
                  </button>
                  <button className="btn btn-secondary text-sm">
                    <div className="icon-eye text-sm"></div>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('Resources component error:', error);
    return null;
  }
}