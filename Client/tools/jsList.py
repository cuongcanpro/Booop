import os
import json


current_dir = os.getcwd()

src_dir = os.path.join(current_dir, 'src')

file_list = []

if os.path.exists(src_dir) and os.path.isdir(src_dir):
    file_list = [os.path.relpath(os.path.join(root, filename), src_dir).replace('\\', '/') for root, _, filenames in os.walk(src_dir) for filename in filenames]
file_list = ['src/' + file_path for file_path in file_list]

for file_path in file_list:
    print(file_path)

json_file_path = os.path.join(current_dir, 'jsList.json')
if not os.path.exists(json_file_path):
    with open(json_file_path, 'w') as json_file:
        json.dump({'jsList': []}, json_file, indent=4)

with open(json_file_path, 'r') as json_file:
    data = json.load(json_file)

data['jsList'] = file_list

with open(json_file_path, 'w') as json_file:
    json.dump(data, json_file, indent=4)
